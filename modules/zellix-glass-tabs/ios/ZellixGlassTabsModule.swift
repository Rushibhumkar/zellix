import ExpoModulesCore
import UIKit

struct GlassTab: Record {
  @Field var key: String = ""
  @Field var title: String = ""
  @Field var symbol: String = ""
  @Field var iconData: String?
}

struct GlassSelectionState: Record {
  @Field var key: String = ""
  @Field var requestId: Int = 0
}

public final class ZellixGlassTabsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZellixGlassTabs")
    Function("isSupported") {
      if #available(iOS 26.0, *) { return UIDevice.current.userInterfaceIdiom == .phone }
      return false
    }
    Function("selectionProtocolVersion") { return 2 }
    View(GlassTabsView.self) {
      Events("onTabSelect")
      Prop("tabs") { (view: GlassTabsView, tabs: [GlassTab]) in
        view.setTabs(tabs)
      }
      Prop("selectedKey") { (view: GlassTabsView, key: String) in
        view.selectedKey = key
      }
      Prop("selectionAcknowledgement") { (view: GlassTabsView, requestId: Int) in
        view.acknowledgeSelection(requestId)
      }
      Prop("selectionState") { (view: GlassTabsView, state: GlassSelectionState) in
        view.updateSelectionState(state)
      }
    }
  }
}

final class GlassTabsView: ExpoView, UITabBarControllerDelegate {
  let onTabSelect = EventDispatcher()
  private let controller = UITabBarController()
  private var keys: [String] = []
  private var tabSignatures: [[String]] = []
  private var selectionRequestId = 0
  private var pendingSelectionRequestId: Int?
  private var usesSelectionState = false
  private var committedKey = ""
  var selectedKey = "" {
    didSet {
      if !usesSelectionState {
        committedKey = selectedKey
        syncSelection()
      }
    }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    controller.delegate = self
    controller.view.backgroundColor = .clear
    let selectedColor = UIColor(red: 45.0 / 255, green: 103.0 / 255, blue: 198.0 / 255, alpha: 1)
    let unselectedColor = UIColor(red: 115.0 / 255, green: 159.0 / 255, blue: 225.0 / 255, alpha: 1)
    controller.tabBar.tintColor = selectedColor
    controller.tabBar.unselectedItemTintColor = unselectedColor
    let appearance = controller.tabBar.standardAppearance
    for itemAppearance in [appearance.stackedLayoutAppearance, appearance.inlineLayoutAppearance, appearance.compactInlineLayoutAppearance] {
      itemAppearance.normal.iconColor = unselectedColor
      itemAppearance.normal.titleTextAttributes = [.foregroundColor: unselectedColor]
      itemAppearance.selected.iconColor = selectedColor
      itemAppearance.selected.titleTextAttributes = [.foregroundColor: selectedColor]
    }
    controller.tabBar.standardAppearance = appearance
    controller.tabBar.scrollEdgeAppearance = appearance
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil {
      if controller.parent != nil {
        controller.willMove(toParent: nil)
        controller.view.removeFromSuperview()
        controller.removeFromParent()
      }
      return
    }
    attachController()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    attachController()
    controller.view.frame = bounds
  }

  private func attachController() {
    guard window != nil, controller.parent == nil else { return }
    var responder = next
    while let current = responder {
      if let parent = current as? UIViewController {
        parent.addChild(controller)
        addSubview(controller.view)
        controller.didMove(toParent: parent)
        return
      }
      responder = current.next
    }
  }

  func setTabs(_ tabs: [GlassTab]) {
    let signatures = tabs.map { [$0.key, $0.title, $0.symbol, $0.iconData ?? ""] }
    guard signatures != tabSignatures else {
      syncSelection()
      return
    }
    let newKeys = tabs.map(\.key)
    let rebuildPages = keys != newKeys
    if rebuildPages {
      keys = newKeys
      controller.setViewControllers(tabs.map { _ in
        let page = UIViewController()
        page.view.backgroundColor = .clear
        return page
      }, animated: false)
    }
    for (index, pair) in zip(controller.viewControllers ?? [], tabs).enumerated() {
      if !rebuildPages && tabSignatures.indices.contains(index) && tabSignatures[index] == signatures[index] {
        continue
      }
      let (page, tab) = pair
      let image = tab.iconData.flatMap { tabIcon(from: $0) }
      page.tabBarItem.title = tab.title
      page.tabBarItem.image = image ?? UIImage(systemName: tab.symbol)
    }
    tabSignatures = signatures
    syncSelection()
  }

  private func tabIcon(from base64: String) -> UIImage? {
    guard let data = Data(base64Encoded: base64),
          let image = UIImage(data: data),
          image.size.width > 0, image.size.height > 0 else { return nil }
    // PNG pixels do not retain the SVG view's point size on Retina screens.
    let size = CGSize(width: 24, height: 24)
    let scale = min(size.width / image.size.width, size.height / image.size.height)
    let drawSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
    let rect = CGRect(x: (size.width - drawSize.width) / 2,
                      y: (size.height - drawSize.height) / 2,
                      width: drawSize.width, height: drawSize.height)
    return UIGraphicsImageRenderer(size: size).image { _ in
      image.draw(in: rect)
    }.withRenderingMode(.alwaysTemplate)
  }

  private func syncSelection() {
    guard pendingSelectionRequestId == nil else { return }
    if let index = keys.firstIndex(of: committedKey), controller.selectedIndex != index {
      controller.selectedIndex = index
    }
  }

  func acknowledgeSelection(_ requestId: Int) {
    guard !usesSelectionState else { return }
    // Reconcile after the complete React prop update, including selectedKey.
    DispatchQueue.main.async { [weak self] in
      guard let self, !self.usesSelectionState, self.pendingSelectionRequestId == requestId else { return }
      self.pendingSelectionRequestId = nil
      self.syncSelection()
    }
  }

  func updateSelectionState(_ state: GlassSelectionState) {
    usesSelectionState = true
    if let pending = pendingSelectionRequestId, state.requestId < pending { return }
    // The key and acknowledgement arrive together, so an old React render
    // cannot move the native indicator back while a newer tap is pending.
    committedKey = state.key
    pendingSelectionRequestId = nil
    syncSelection()
  }

  func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
    guard let index = tabBarController.viewControllers?.firstIndex(of: viewController),
          keys.indices.contains(index) else { return false }
    selectionRequestId += 1
    pendingSelectionRequestId = selectionRequestId
    onTabSelect(["key": keys[index], "requestId": selectionRequestId])
    // Animate the glass selection immediately on the UI thread. React still
    // owns screen navigation and reconciles accepted or prevented presses.
    return true
  }
}
