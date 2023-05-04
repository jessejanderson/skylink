mkdir -p ./extension_packages/ff_build
cp manifest-firefox.json ./extension_packages/ff_build/manifest.json
cp ./*.png ./*.js ./*.html ./*.md LICENSE ./extension_packages/ff_build/
zip -j ./extension_packages/skylink-firefox.zip ./extension_packages/ff_build/*
