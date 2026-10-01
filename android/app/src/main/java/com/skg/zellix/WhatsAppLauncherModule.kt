package com.skg.zellix

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WhatsAppLauncherModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val WHATSAPP_PACKAGE = "com.whatsapp"
    private const val WHATSAPP_BUSINESS_PACKAGE = "com.whatsapp.w4b"
  }

  private data class WhatsAppTarget(
    val packageName: String,
    val className: String? = null,
  )

  override fun getName(): String = "WhatsAppLauncher"

  @ReactMethod
  fun open(url: String, promise: Promise) {
    if (url.isBlank()) {
      promise.reject("INVALID_WHATSAPP_URL", "WhatsApp URL is required")
      return
    }

    try {
      val fallbackUri = Uri.parse(url)
      val whatsappUri = createWhatsAppUri(fallbackUri)
      val targets = findWhatsAppTargets(whatsappUri)

      val intent = when (targets.size) {
        0 -> Intent(Intent.ACTION_VIEW, fallbackUri)
        1 -> createWhatsAppIntent(whatsappUri, targets.first())
        else -> {
          val primaryIntent = createWhatsAppIntent(whatsappUri, targets.first())
          val otherIntents = targets.drop(1)
            .map { createWhatsAppIntent(whatsappUri, it) }
            .toTypedArray()

          Intent.createChooser(primaryIntent, "Open with WhatsApp").apply {
            putExtra(Intent.EXTRA_INITIAL_INTENTS, otherIntents)
          }
        }
      }

      val activity = reactApplicationContext.currentActivity
      if (activity == null) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      (activity ?: reactApplicationContext).startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("WHATSAPP_OPEN_FAILED", error.message, error)
    }
  }

  private fun createWhatsAppUri(source: Uri): Uri {
    if (source.scheme == "whatsapp") return source

    val phone = when (source.host?.lowercase()) {
      "wa.me", "www.wa.me" -> source.pathSegments.firstOrNull()
      else -> source.getQueryParameter("phone")
    }?.filter(Char::isDigit)

    if (phone.isNullOrBlank()) return source

    return Uri.Builder()
      .scheme("whatsapp")
      .authority("send")
      .appendQueryParameter("phone", phone)
      .apply {
        source.getQueryParameter("text")?.takeIf(String::isNotBlank)?.let {
          appendQueryParameter("text", it)
        }
      }
      .build()
  }

  private fun findWhatsAppTargets(uri: Uri): List<WhatsAppTarget> {
    val packageManager = reactApplicationContext.packageManager
    val resolvedTargets = packageManager
      .queryIntentActivities(Intent(Intent.ACTION_VIEW, uri), PackageManager.MATCH_DEFAULT_ONLY)
      .mapNotNull { resolved ->
        val activityInfo = resolved.activityInfo ?: return@mapNotNull null
        val packageName = activityInfo.packageName
        val label = resolved.loadLabel(packageManager)?.toString().orEmpty()
        val isWhatsApp = packageName == WHATSAPP_PACKAGE ||
          packageName == WHATSAPP_BUSINESS_PACKAGE ||
          label.contains("WhatsApp", ignoreCase = true)

        if (isWhatsApp) WhatsAppTarget(packageName, activityInfo.name) else null
      }

    val uniqueResolvedTargets = resolvedTargets.distinctBy(WhatsAppTarget::packageName)
    val resolvedPackages = uniqueResolvedTargets.mapTo(mutableSetOf(), WhatsAppTarget::packageName)
    val installedTargets = listOf(
      WHATSAPP_PACKAGE,
      WHATSAPP_BUSINESS_PACKAGE,
    ).filter { it !in resolvedPackages && isPackageInstalled(it) }
      .map(::WhatsAppTarget)

    return uniqueResolvedTargets + installedTargets
  }

  private fun createWhatsAppIntent(uri: Uri, target: WhatsAppTarget) =
    Intent(Intent.ACTION_VIEW, uri).apply {
      if (target.className.isNullOrBlank()) {
        setPackage(target.packageName)
      } else {
        setClassName(target.packageName, target.className)
      }
    }

  private fun isPackageInstalled(packageName: String): Boolean = try {
    reactApplicationContext.packageManager.getApplicationInfo(packageName, 0)
    true
  } catch (_: PackageManager.NameNotFoundException) {
    false
  }
}
