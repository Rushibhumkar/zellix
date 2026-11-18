Pod::Spec.new do |s|
  s.name = 'ZellixGlassTabs'
  s.version = '1.0.0'
  s.summary = 'Native iPhone tab bar for Zellix'
  s.homepage = 'https://github.com/Rushibhumkar/zellix'
  s.license = { :type => 'Proprietary' }
  s.author = 'Zellix'
  s.source = { :path => '.' }
  s.platform = :ios, '16.0'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.swift'
end
