package expo.modules.zellixglasstabs

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.view.ContextThemeWrapper
import android.view.Menu
import android.view.View
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.navigation.NavigationBarView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlin.math.roundToInt

class ZellixBottomTabsView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true
  private val onTabSelect by EventDispatcher()
  private val onTabLongPress by EventDispatcher()
  private val selection = TabSelection()
  private var latestSelection: NativeSelection? = null
  private var signatures = emptyList<List<String>>()
  private var keys = emptyList<String>()
  private var synchronizing = false
  private val bar = BottomNavigationView(ContextThemeWrapper(context,
    com.google.android.material.R.style.Theme_Material3_Light_NoActionBar))

  init {
    orientation = LinearLayout.VERTICAL
    clipChildren = false
    clipToPadding = false
    setBackgroundColor(Color.rgb(243, 247, 253))
    setBottomInset(0.0)
    val colors = ColorStateList(arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf()),
      intArrayOf(Color.rgb(46, 103, 190), Color.rgb(100, 116, 139)))
    bar.apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, dp(80))
      labelVisibilityMode = NavigationBarView.LABEL_VISIBILITY_LABELED
      isItemHorizontalTranslationEnabled = false
      itemIconTintList = colors
      itemTextColor = colors
      // Use Material 3's native pill indicator, icon/label layout and ripple.
      isItemActiveIndicatorEnabled = true
      itemActiveIndicatorColor = ColorStateList.valueOf(Color.rgb(220, 234, 255))
      setBackgroundColor(Color.rgb(243, 247, 253))
      // React supplies the system bottom inset once through bottomInset.
      ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets -> insets }
      setOnItemSelectedListener { item ->
        if (!synchronizing) sendSelection(item.itemId)
        true
      }
      setOnItemReselectedListener { item -> if (!synchronizing) sendSelection(item.itemId) }
    }
    addView(bar)
  }

  fun setBottomInset(inset: Double) {
    val safeInset = if (inset.isFinite()) inset.coerceIn(0.0, 200.0) else 0.0
    setPadding(0, 0, 0, dp(safeInset))
    requestLayout()
  }

  fun setTabs(incoming: List<NativeTab>) {
    val valid = incoming.filter { it.key.isNotBlank() }.distinctBy { it.key }.take(5)
    val nextSignatures = valid.map { listOf(it.key, it.title, it.symbol) }
    if (nextSignatures == signatures) return
    val nextKeys = valid.map { it.key }
    synchronizing = true
    try {
      if (nextKeys != keys) {
        bar.menu.clear()
        valid.forEachIndexed { index, tab -> bar.menu.add(Menu.NONE, index + 1, index, tab.title) }
      }
      valid.forEachIndexed { index, tab ->
        if (nextKeys != keys || signatures.getOrNull(index) != nextSignatures[index]) {
          bar.menu.findItem(index + 1)?.apply {
            title = tab.title
            icon = fallbackIcon(tab.symbol)
          }
        }
        bar.findViewById<View>(index + 1)?.setOnLongClickListener {
          onTabLongPress(mapOf("key" to tab.key))
          true
        }
      }
      keys = nextKeys
      signatures = nextSignatures
      selection.updateKeys(keys)
    } finally {
      synchronizing = false
    }
    syncSelection()
    requestLayout()
  }

  fun setSelection(state: NativeSelection) {
    latestSelection = state
  }

  fun reconcileProps() {
    val state = latestSelection ?: return
    if (selection.reconcile(state.key, state.requestId)) syncSelection()
  }

  private fun sendSelection(itemId: Int) {
    val key = keys.getOrNull(itemId - 1) ?: return
    val requestId = selection.select(key) ?: return
    onTabSelect(mapOf("key" to key, "requestId" to requestId))
  }

  private fun syncSelection() {
    val index = keys.indexOf(selection.displayedKey)
    if (index < 0 || bar.selectedItemId == index + 1) return
    synchronizing = true
    try { bar.selectedItemId = index + 1 } finally { synchronizing = false }
  }

  private fun fallbackIcon(symbol: String): Drawable? {
    val resource = when (symbol) {
      "square.grid.2x2" -> R.drawable.zellix_tab_dashboard
      "person.2" -> R.drawable.zellix_tab_people
      "calendar" -> R.drawable.zellix_tab_calendar
      "calendar.badge.clock" -> R.drawable.zellix_tab_event
      "chart.bar" -> R.drawable.zellix_tab_report
      "calendar.badge.checkmark" -> R.drawable.zellix_tab_leave
      "video" -> R.drawable.zellix_tab_interview
      else -> R.drawable.zellix_tab_dashboard
    }
    return ContextCompat.getDrawable(context, resource)
  }

  private fun dp(value: Int) = dp(value.toDouble())
  private fun dp(value: Double) = (value * resources.displayMetrics.density).roundToInt()
}
