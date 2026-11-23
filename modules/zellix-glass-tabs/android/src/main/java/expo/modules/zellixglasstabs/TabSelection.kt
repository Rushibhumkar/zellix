package expo.modules.zellixglasstabs

/** Native taps remain visible until React resolves that tap or a newer one. */
internal class TabSelection {
  private var keys = emptyList<String>()
  private var committedKey = ""
  private var nextRequestId = 0
  private var pendingKey: String? = null
  private var pendingRequestId: Int? = null
  val displayedKey: String get() = pendingKey ?: committedKey

  fun updateKeys(newKeys: List<String>) {
    keys = newKeys
    if (pendingKey !in keys) {
      pendingKey = null
      pendingRequestId = null
    }
    if (committedKey !in keys) committedKey = keys.firstOrNull().orEmpty()
  }

  fun select(key: String): Int? {
    if (key !in keys) return null
    nextRequestId += 1
    pendingRequestId = nextRequestId
    pendingKey = key
    return nextRequestId
  }

  fun reconcile(key: String, requestId: Int): Boolean {
    if (key !in keys || (pendingRequestId?.let { requestId < it } == true)) return false
    nextRequestId = maxOf(nextRequestId, requestId)
    committedKey = key
    pendingKey = null
    pendingRequestId = null
    return true
  }
}
