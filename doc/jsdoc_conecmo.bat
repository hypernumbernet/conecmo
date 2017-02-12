rem Generating Conecmo jsdoc

call %USERPROFILE%\node_modules\.bin\jsdoc ..\www\js -d ..\..\conecmo_jsdoc -c jsdoc_conf.json -t %USERPROFILE%\node_modules\ink-docstrap\template -R ..\README.md

rundll32.exe url.dll,FileProtocolHandler "..\..\conecmo_jsdoc\index.html"
