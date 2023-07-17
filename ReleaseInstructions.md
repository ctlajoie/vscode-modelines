## Release Steps

1. Go to https://chrislajoie.visualstudio.com/ and generate personal access token
2. Increment version in package.json
3. Run `vsce package` to create vsix file
4. Install extension in vscode using vsix
5. Publish the extension with `vsix publish`


### Links

- https://chrislajoie.visualstudio.com/
- https://chrislajoie.visualstudio.com/vscode-modelines
- https://marketplace.visualstudio.com/manage/publishers/chrislajoie
- https://github.com/eclipse/openvsx/wiki/Publishing-Extensions
