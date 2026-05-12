const fs = require('fs')
const path = 'android/app/build.gradle'
let c = fs.readFileSync(path, 'utf8')

const signing = `
    signingConfigs {
        release {
            storeFile file('adminkey.jks')
            storePassword 'adminkey'
            keyAlias 'adminkey'
            keyPassword 'adminkey'
        }
    }`

c = c.replace('buildTypes {', signing + '\n    buildTypes {')
c = c.replace(/buildTypes\s*\{\s*release\s*\{/, 'buildTypes {\n        release {\n            signingConfig signingConfigs.release')

fs.writeFileSync(path, c)
