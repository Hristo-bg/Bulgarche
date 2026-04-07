[Setup]
AppName=Bulgarche Desktop
AppVersion=4.0.0
AppPublisher=Bulgarche
DefaultDirName={pf}\Bulgarche Desktop
DefaultGroupName=Bulgarche
AllowNoIcons=yes
OutputDir=dist-installer-real
OutputBaseFilename=bulgarche-desktop-real-setup
SetupIconFile=icon\bulgarche-icon.png
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\Bulgarche Desktop.exe

[Files]
Source: "dist-real\Bulgarche Desktop.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist-real\resources\*"; DestDir: "{app}\resources"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "txt\*"; DestDir: "{app}\txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "audiofiles\*"; DestDir: "{app}\audiofiles"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "icon\*"; DestDir: "{app}\icon"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Bulgarche Desktop"; Filename: "{app}\Bulgarche Desktop.exe"; Comment: "Learn Bulgarian with Bulgarche"
Name: "{group}\{cm:UninstallProgram,Bulgarche Desktop}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Bulgarche Desktop"; Filename: "{app}\Bulgarche Desktop.exe"; Tasks: desktopicon; Comment: "Learn Bulgarian with Bulgarche"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\Bulgarche Desktop.exe"; Description: "Launch Bulgarche Desktop"; Flags: nowait postinstall skipifsilent unchecked

[UninstallDelete]
Type: filesandordirs; Name: "{app}\public"
Type: filesandordirs; Name: "{app}\txt"
Type: filesandordirs; Name: "{app}\audiofiles"
Type: filesandordirs; Name: "{app}\icon"
Type: filesandordirs; Name: "{app}\resources"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Create desktop shortcut with correct icon
    if CreateDesktopShortcut then
    begin
      CreateShortcut(
        ExpandConstant('{commondesktop}\Bulgarche Desktop.lnk'),
        ExpandConstant('{app}\Bulgarche Desktop.exe'),
        '',
        ExpandConstant('{app}'),
        '',
        '',
        0,
        SW_SHOWNORMAL,
        ExpandConstant('{app}\Bulgarche Desktop.exe'),
        0,
        ''
      );
    end;
  end;
end;
