package expo.modules.zellixglasstabs

import org.junit.Assert.*
import org.junit.Test

class TabSelectionTest {
  private fun initial() = TabSelection().apply {
    updateKeys(listOf("dashboard", "data", "reports"))
    reconcile("dashboard", 0)
  }

  @Test fun rapidTapsKeepTheLatestNativeSelection() {
    val selection = initial()
    val first = selection.select("data")!!
    val latest = selection.select("reports")!!
    assertEquals("reports", selection.displayedKey)
    assertFalse(selection.reconcile("data", first))
    assertFalse(selection.reconcile("dashboard", 0))
    assertEquals("reports", selection.displayedKey)
    assertTrue(selection.reconcile("reports", latest))
  }

  @Test fun preventedPressReturnsToTheCommittedRoute() {
    val selection = initial()
    val request = selection.select("reports")!!
    assertTrue(selection.reconcile("dashboard", request))
    assertEquals("dashboard", selection.displayedKey)
  }

  @Test fun programmaticBackUpdatesTheNativeIndicator() {
    val selection = initial()
    selection.reconcile("reports", selection.select("reports")!!)
    assertTrue(selection.reconcile("dashboard", 0))
    assertEquals("dashboard", selection.displayedKey)
  }

  @Test fun permissionChangesRemovePendingAndUnavailableTabs() {
    val selection = initial()
    val request = selection.select("reports")!!
    selection.updateKeys(listOf("dashboard", "data"))
    assertEquals("dashboard", selection.displayedKey)
    assertNull(selection.select("reports"))
    assertFalse(selection.reconcile("reports", request))
  }

  @Test fun iconUpdatesDoNotInterruptAPendingPress() {
    val selection = initial()
    val request = selection.select("reports")!!
    selection.updateKeys(listOf("dashboard", "data", "reports"))
    assertFalse(selection.reconcile("dashboard", 0))
    assertEquals("reports", selection.displayedKey)
    assertTrue(selection.reconcile("reports", request))
  }

  @Test fun keyboardRemountSeedsMonotonicRequestIds() {
    val selection = initial()
    assertTrue(selection.reconcile("data", 12))
    val next = selection.select("reports")!!
    assertTrue(next > 12)
    assertFalse(selection.reconcile("data", 12))
    assertEquals("reports", selection.displayedKey)
  }

  @Test fun aSinglePermittedTabCanBeReselected() {
    val selection = TabSelection()
    selection.updateKeys(listOf("attendance"))
    val request = selection.select("attendance")!!
    assertTrue(selection.reconcile("attendance", request))
    assertEquals("attendance", selection.displayedKey)
  }

  @Test fun unknownAndRemovedRouteKeysAreIgnored() {
    val selection = initial()
    assertNull(selection.select("unknown"))
    assertFalse(selection.reconcile("unknown", 0))
    selection.updateKeys(emptyList())
    assertEquals("", selection.displayedKey)
    selection.updateKeys(listOf("data"))
    assertEquals("data", selection.displayedKey)
  }
}
