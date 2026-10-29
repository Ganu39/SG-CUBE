Set WshShell = CreateObject("WScript.Shell")
strPath = WScript.ScriptFullName
strDir = Left(strPath, InStrRev(strPath, "\") - 1)
WshShell.CurrentDirectory = strDir

pythonwExe = ""
Set fso = CreateObject("Scripting.FileSystemObject")
If fso.FileExists(strDir & "\.venv\Scripts\pythonw.exe") Then
    pythonwExe = strDir & "\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(strDir & "\runtime\Scripts\pythonw.exe") Then
    pythonwExe = strDir & "\runtime\Scripts\pythonw.exe"
ElseIf fso.FileExists(strDir & "\runtime\pythonw.exe") Then
    pythonwExe = strDir & "\runtime\pythonw.exe"
Else
    pythonwExe = "pythonw.exe"
End If

WshShell.Run """" & pythonwExe & """ """ & strDir & "\wake_listener.py""", 0, False

