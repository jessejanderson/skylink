#!/bin/sh

clean() {
    rm -rf ./extension_packages
}

build_firefox() {
    mkdir -p ./extension_packages/ff_build
    cp manifest-firefox.json ./extension_packages/ff_build/manifest.json
    cp ./*.png ./*.js ./*.html ./*.md LICENSE ./extension_packages/ff_build/
    zip -j ./extension_packages/skylink-firefox.zip ./extension_packages/ff_build/*
}

while [ $# -gt 0 ]; do
    case "$1" in
        --firefox)
            build_firefox
            ;;
        *)
            echo "Invalid option: $1"
            exit 1
            ;;
    esac
    shift
done
