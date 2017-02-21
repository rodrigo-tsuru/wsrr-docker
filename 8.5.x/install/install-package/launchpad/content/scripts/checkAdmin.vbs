'Licensed Materials - Property of IBM
'5725-C94 5725-C95 5725-C96 5724-M24 5724-I82 5724-N72 5655-WBS
'Copyright IBM Corporation 2011, 2012. All Rights Reserved.
'US Government Users Restricted Rights- Use, duplication or disclosure
'restricted by GSA ADP Schedule Contract with IBM Corp.set

args = WScript.Arguments.Count

If args < 1 then
  WScript.Echo "usage: isAdmin.vbs argument [argument] "
  WScript.Quit
end If

strComputer = "."
Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\cimv2")

Set colItems = objWMIService.ExecQuery _
  ("SELECT Domain, Name FROM Win32_Group WHERE SID = 'S-1-5-32-544'")

Set Network = WScript.CreateObject("WScript.Network")

Set fso = CreateObject("Scripting.FileSystemObject")
Set objFile = fso.OpenTextFile(WScript.Arguments.Item(0), _
   2, True, 0)
objFile.WriteLine "{isAdmin: false}"
objFile.Close

For Each objItem In colItems
  For Each objAdmin In objWMIService.ExecQuery _
    ("ASSOCIATORS OF {Win32_Group.Domain='" & objItem.Domain & "',Name='" & objItem.Name & "'} WHERE AssocClass = Win32_GroupUser")
    If objAdmin.Name = Network.UserName Then
	Set fso = CreateObject("Scripting.FileSystemObject")
	Set objFile = fso.OpenTextFile(WScript.Arguments.Item(0), _
	   2, True, 0)
	objFile.WriteLine "{isAdmin: true}"
        objFile.Close
	Exit For
	Exit For
    End If	
  Next
Next