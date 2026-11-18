import ExpoModulesCore
import UIKit

struct GlassTab: Record {
  @Field var key: String = ""
  @Field var title: String = ""
  @Field var symbol: String = ""
  @Field var iconData: String?
}

public final class ZellixGlassTabsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZellixGlassTabs")
    Function("isSupported") {
      if #available(iOS 26.0, *) { return UIDevice.current.userInterfaceIdiom == .phone }
      return false
    }
    View(GlassTabsView.self) {
      Events("onTabSelect")
      Prop("tabs") { (view: GlassTabsView, tabs: [GlassTab]) in
        view.setTabs(tabs)
      }
      Prop("selectedKey") { (view: GlassTabsView, key: String) in
        view.selectedKey = key
      }
    }
  }
}

final class GlassTabsView: ExpoView, UITabBarControllerDelegate {
  let onTabSelect = EventDispatcher()
  private let controller = UITabBarController()
  private var keys: [String] = []
  private var tabSignatures: [[String]] = []
  var selectedKey = "" {
    didSet { syncSelection() }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    controller.delegate = self
    controller.view.backgroundColor = .clear
    controller.tabBar.tintColor = UIColor(red: 45.0 / 255, green: 103.0 / 255, blue: 198.0 / 255, alpha: 1)
    controller.tabBar.unselectedItemTintColor = UIColor(red: 115.0 / 255, green: 159.0 / 255, blue: 225.0 / 255, alpha: 1)
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
    let signatures = tabs.map { [$0.key, $0.title, $0.symbol] }
    if signatures != tabSignatures {
      tabSignatures = signatures
      keys = tabs.map(\.key)
      controller.setViewControllers(tabs.map { _ in
        let page = UIViewController()
        page.view.backgroundColor = .clear
        return page
      }, animated: false)
    }
    for (page, tab) in zip(controller.viewControllers ?? [], tabs) {
      let image = tab.iconData
        .flatMap { Data(base64Encoded: $0) }
        .flatMap { UIImage(data: $0) }?
        .withRenderingMode(.alwaysTemplate)
      page.tabBarItem = UITabBarItem(title: tab.title, image: image ?? UIImage(systemName: tab.symbol), selectedImage: nil)
    }
    syncSelection()
  }

  private func syncSelection() {
    if let index = keys.firstIndex(of: selectedKey), controller.selectedIndex != index {
      controller.selectedIndex = index
    }
  }

  func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
    guard let index = tabBarController.viewControllers?.firstIndex(of: viewController),
          keys.indices.contains(index) else { return false }
    onTabSelect(["key": keys[index]])
    // React Navigation owns selection and may prevent the tab press.
    return false
  }
}
