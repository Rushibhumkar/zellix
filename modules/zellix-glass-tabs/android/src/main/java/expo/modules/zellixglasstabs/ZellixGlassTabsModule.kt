package expo.modules.zellixglasstabs

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class NativeTab : Record {
  @Field var key: String = ""
  @Field var title: String = ""
  @Field var symbol: String = ""
  @Field var iconData: String? = null
}

class NativeSelection : Record {
  @Field var key: String = ""
  @Field var requestId: Int = 0
}

class ZellixGlassTabsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZellixGlassTabs")
    Function("isSupported") { true }
    Function("selectionProtocolVersion") { 2 }
    View(ZellixBottomTabsView::class) {
      Events("onTabSelect", "onTabLongPress")
      Prop("tabs") { view: ZellixBottomTabsView, tabs: List<NativeTab> -> view.setTabs(tabs) }
      // Android uses the atomic key + requestId protocol exclusively. These
      // legacy props remain accepted for the shared iOS/Android JS interface.
      Prop("selectedKey") { _: ZellixBottomTabsView, _: String -> }
      Prop("selectionAcknowledgement") { _: ZellixBottomTabsView, _: Int -> }
      Prop("selectionState") { view: ZellixBottomTabsView, state: NativeSelection -> view.setSelection(state) }
      OnViewDidUpdateProps { view: ZellixBottomTabsView -> view.reconcileProps() }
      Prop("bottomInset") { view: ZellixBottomTabsView, inset: Double -> view.setBottomInset(inset) }
    }
  }
}
