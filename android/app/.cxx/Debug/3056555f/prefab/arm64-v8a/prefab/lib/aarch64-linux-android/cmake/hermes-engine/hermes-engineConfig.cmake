if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/macbookpro/.gradle/caches/8.14.3/transforms/bad0042fd7bbfb5b4aeb10c007e08098/transformed/hermes-android-0.81.4-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/macbookpro/.gradle/caches/8.14.3/transforms/bad0042fd7bbfb5b4aeb10c007e08098/transformed/hermes-android-0.81.4-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

