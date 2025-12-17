#!/bin/bash
set -e  # interrompe se algum comando falhar

# === JAVA CONFIG ===
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# === ANDROID SDK CONFIG ===
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# === LOG VISUAL ===
echo "=============================="
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "=============================="
java -version
adb version || echo "ADB não encontrado (ok se não estiver no PATH ainda)"
echo "=============================="

# === BUILD ===
eas build -p android --profile preview --local
