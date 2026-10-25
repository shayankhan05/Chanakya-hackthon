$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSCommandPath
$docxPath=Join-Path $taskRoot 'ComplianceCopilot-User-Guide.docx'
$pdfPath=Join-Path $taskRoot 'ComplianceCopilot-User-Guide.pdf'
$word=$null
$document=$null
try {
  $word=New-Object -ComObject Word.Application
  $word.Visible=$false
  $word.DisplayAlerts=0
  $document=$word.Documents.Open($docxPath,$false,$false)
  foreach($styleName in @('TOC 1','TOC Heading')) {
    try {$style=$document.Styles.Item($styleName);$style.Font.Name='Arial';$style.Font.Size=10;$style.Font.Color=0;$style.Font.Underline=0} catch {}
  }
  $null=$document.Fields.Update()
  foreach($toc in $document.TablesOfContents){$toc.Update()}
  $document.Repaginate()
  $null=$document.Fields.Update()
  $document.Save()
  $pages=$document.ComputeStatistics(2)
  $document.ExportAsFixedFormat($pdfPath,17)
  Write-Output "Word rendered $pages pages."
  Write-Output $pdfPath
} finally {
  if($document){$document.Close(0);[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document)}
  if($word){try {$word.Quit()} catch {if($_.Exception.HResult -ne -2147023174){throw}};[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)}
}
