#!/bin/sh

# This was tested on macOS 13.3.1 using the builtin zip command at /usr/bin/zip
# It should also work on Linux, but I haven't tested it.

check_zip() {
    if ! command -v zip >/dev/null 2>&1; then
        printf "zip command not found. Attempting to install...\n"
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get install zip
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf install zip
        else
            printf "Cannot determine package manager. Please install 'zip' manually.\n"
            exit 1
        fi
    fi
}

check_zip

clean() {
    rm -rf ./extension_packages/ff_build
    rm -rf ./extension_packages/chrome_build
}

build_firefox() {
    printf "Building Firefox Extension\n\n"
    mkdir -p ./extension_packages/ff_build
    cp manifest-firefox.json ./extension_packages/ff_build/manifest.json
    cp ./*.png ./*.js ./*.html ./*.md LICENSE ./extension_packages/ff_build/
    zip -j ./extension_packages/skylink-firefox.zip ./extension_packages/ff_build/*
    printf "\nFirefox extension available at ./extension_packages/skylink-firefox.zip\n"
}

build_chrome() {
    printf "Building Chrome Extension\n\n"
    mkdir -p ./extension_packages/chrome_build
    cp manifest.json ./extension_packages/chrome_build/manifest.json
    cp ./*.png ./*.js ./*.html ./*.md LICENSE ./extension_packages/chrome_build/
    zip -j ./extension_packages/skylink-chrome.zip ./extension_packages/chrome_build/*
    printf "\nChrome extension available at ./extension_packages/skylink-chrome.zip\n"
}

display_help() {
    echo "Usage: $0 [--firefox] [--chrome] [--all] [--help]"
    echo "Options:"
    echo "  --firefox   Build Firefox extension"
    echo "  --chrome    Build Chrome extension"
    echo "  --all       Build both Firefox and Chrome extensions"
    echo "  --help      Display this help message"
}

if [ $# -eq 0 ]; then
    display_help
    exit 0
fi

while [ $# -gt 0 ]; do
    case "$1" in
        --firefox)
            clean
            build_firefox
            ;;
        --chrome)
            clean
            build_chrome
            ;;
        --all)
            clean
            build_firefox
            printf "\n\n"
            build_chrome
            ;;
        --help)
            display_help
            exit 0
            ;;
        *)
            echo "Invalid option: $1"
            display_help
            exit 1
            ;;
    esac
    shift
done
