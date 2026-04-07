[Setup]
AppName=Bulgarche Desktop
AppVersion=4.0.0
AppPublisher=Bulgarche
AppPublisherURL=https://bulgarche.com
AppSupportURL=https://bulgarche.com/support
AppUpdatesURL=https://bulgarche.com/updates
DefaultDirName={pf}\Bulgarche Desktop
DefaultGroupName=Bulgarche
AllowNoIcons=yes
OutputDir=dist-installer-desktop
OutputBaseFilename=bulgarche-desktop-setup-v4.0.0
SetupIconFile=icon\bulgarche-icon.ico
WizardImageFile=icon\bulgarche-icon.png
WizardSmallImageFile=icon\bulgarche-icon.png
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
UsePreviousAppDir=yes
UsePreviousGroup=yes
UsePreviousTasks=yes
UsePreviousLanguage=yes
UninstallDisplayIcon={app}\icon\bulgarche-icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "bulgarian"; MessagesFile: "compiler:Languages\Bulgarian.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; OnlyBelowVersion: 6.1

[Files]
Source: "dist-desktop-final\Bulgarche Desktop Setup *.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist-desktop-final\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "txt\*"; DestDir: "{app}\txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "audiofiles\*"; DestDir: "{app}\audiofiles"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "icon\*"; DestDir: "{app}\icon"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Bulgarche Desktop"; Filename: "{app}\Bulgarche Desktop.exe"; IconFilename: "{app}\icon\bulgarche-icon.ico"; Comment: "Learn Bulgarian with Bulgarche"
Name: "{group}\{cm:UninstallProgram,Bulgarche Desktop}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Bulgarche Desktop"; Filename: "{app}\Bulgarche Desktop.exe"; Tasks: desktopicon; Comment: "Learn Bulgarian with Bulgarche"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Bulgarche Desktop"; Filename: "{app}\Bulgarche Desktop.exe"; Tasks: quicklaunchicon; IconFilename: "{app}\icon\bulgarche-icon.ico"

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
var
  ResultCode: Integer;
  Version: String;
begin
  // Check if Node.js is installed
  if not Exec('cmd', '/C node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if MsgBox('Node.js is required to run Bulgarche Desktop.' + #13#10 +
           'Would you like to download and install Node.js now?' + #13#10 +
           'This will open the Node.js download page in your browser.',
           mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://nodejs.org/en/download/', '', '', SW_SHOWNORMAL, ewNoWait, ResultCode);
    end;
    Result := False;
    Exit;
  end;
  
  if ResultCode <> 0 then
  begin
    if MsgBox('Node.js is required to run Bulgarche Desktop.' + #13#10 +
           'Would you like to download and install Node.js now?' + #13#10 +
           'This will open the Node.js download page in your browser.',
           mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://nodejs.org/en/download/', '', '', SW_SHOWNORMAL, ewNoWait, ResultCode);
    end;
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
    // Create app data directory for user settings
    if not DirExists(ExpandConstant('{userappdata}\Bulgarche Desktop')) then
      CreateDir(ExpandConstant('{userappdata}\Bulgarche Desktop'));
    
    // Copy user settings template if it doesn't exist
    if FileExists(ExpandConstant('{app}\txt\settings-template.json')) and 
       not FileExists(ExpandConstant('{userappdata}\Bulgarche Desktop\settings.json')) then
      FileCopy(ExpandConstant('{app}\txt\settings-template.json'), ExpandConstant('{userappdata}\Bulgarche Desktop\settings.json'), False);
  end;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  // Skip the "Ready to Install" page if we want a simpler installation
  Result := (PageID = wpReady);
end;

function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;

function InitializeUninstall(): Boolean;
var
  ResultCode: Integer;
begin
  // Backup user settings before uninstall
  if DirExists(ExpandConstant('{userappdata}\Bulgarche Desktop')) then
  begin
    if MsgBox('Do you want to keep your user settings and progress?' + #13#10 +
           'Click Yes to keep your data for future installations.' + #13#10 +
           'Click No to remove all data.',
           mbConfirmation, MB_YESNO) = IDNO then
    begin
      DelTree(ExpandConstant('{userappdata}\Bulgarche Desktop'), True, True, True);
    end;
  end;
  Result := True;
end;
