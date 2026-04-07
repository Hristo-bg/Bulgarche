[Setup]
AppName=Bulgarche Desktop
AppVersion=4.0.0
AppPublisher=Bulgarche
AppPublisherURL=https://bulgarche.com
AppSupportURL=https://bulgarche.com/support
AppUpdatesURL=https://bulgarche.com/updates
DefaultDirName={pf}\Bulgarche
DefaultGroupName=Bulgarche
AllowNoIcons=yes
OutputDir=dist-installer
OutputBaseFilename=bulgarche-desktop-setup
SetupIconFile=icon\bulgarche-icon.png
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "bulgarian"; MessagesFile: "compiler:Languages\Bulgarian.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; OnlyBelowVersion: 6.1

[Files]
Source: "main-electron-final.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "txt\*"; DestDir: "{app}\txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "audiofiles\*"; DestDir: "{app}\audiofiles"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "icon\*"; DestDir: "{app}\icon"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package-electron.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "node_modules\electron\*"; DestDir: "{app}\node_modules\electron"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: ".git*,*.md,*.txt,*.log"
Source: "node_modules\electron-builder\*"; DestDir: "{app}\node_modules\electron-builder"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: ".git*,*.md,*.txt,*.log"

[Icons]
Name: "{group}\Bulgarche Desktop"; Filename: "{app}\bulgarche-desktop.exe"; IconFilename: "{app}\icon\bulgarche-icon.png"; Comment: "Learn Bulgarian with Bulgarche"
Name: "{group}\{cm:UninstallProgram,Bulgarche Desktop}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Bulgarche Desktop"; Filename: "{app}\bulgarche-desktop.exe"; Tasks: desktopicon; Comment: "Learn Bulgarian with Bulgarche"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Bulgarche Desktop"; Filename: "{app}\bulgarche-desktop.exe"; Tasks: quicklaunchicon; IconFilename: "{app}\icon\bulgarche-icon.png"

[Run]
Filename: "{app}\bulgarche-desktop.exe"; Description: "Launch Bulgarche Desktop"; Flags: nowait postinstall skipifsilent unchecked

[UninstallDelete]
Type: filesandordirs; Name: "{app}\node_modules"
Type: filesandordirs; Name: "{app}\public"
Type: filesandordirs; Name: "{app}\txt"
Type: filesandordirs; Name: "{app}\audiofiles"
Type: filesandordirs; Name: "{app}\icon"

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
end;
