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
Source: "simple-server.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "txt\*"; DestDir: "{app}\txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "audiofiles\*"; DestDir: "{app}\audiofiles"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "icon\*"; DestDir: "{app}\icon"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Bulgarche Desktop"; Filename: "{app}\bulgarche-launcher.exe"; IconFilename: "{app}\icon\bulgarche-icon.png"; Comment: "Learn Bulgarian with Bulgarche"
Name: "{group}\{cm:UninstallProgram,Bulgarche Desktop}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Bulgarche Desktop"; Filename: "{app}\bulgarche-launcher.exe"; Tasks: desktopicon; Comment: "Learn Bulgarian with Bulgarche"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Bulgarche Desktop"; Filename: "{app}\bulgarche-launcher.exe"; Tasks: quicklaunchicon; IconFilename: "{app}\icon\bulgarche-icon.png"

[Run]
Filename: "{app}\bulgarche-launcher.exe"; Description: "Launch Bulgarche Desktop"; Flags: nowait postinstall skipifsilent unchecked

[UninstallDelete]
Type: filesandordirs; Name: "{app}\public"
Type: filesandordirs; Name: "{app}\txt"
Type: filesandordirs; Name: "{app}\audiofiles"
Type: filesandordirs; Name: "{app}\icon"

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  // Check if Node.js is installed
  if not Exec('cmd', '/C node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('Node.js is required to run Bulgarche Desktop.' + #13#10 +
           'Please install Node.js from https://nodejs.org/ and run the installer again.',
           mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  if ResultCode <> 0 then
  begin
    MsgBox('Node.js is required to run Bulgarche Desktop.' + #13#10 +
           'Please install Node.js from https://nodejs.org/ and run the installer again.',
           mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Install Node.js dependencies
    Exec('cmd', '/C cd /D "{app}" && npm install', '', SW_SHOW, ewWaitUntilTerminated, ResultCode);
  end;
end;
