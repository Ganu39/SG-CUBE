param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "on", "off")]
    [string]$Action
)

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }[0]

    function AwaitOp($op, $t) {
        $netTask = $asTaskGeneric.MakeGenericMethod($t).Invoke($null, @($op))
        $netTask.Wait(-1) | Out-Null
        return $netTask.Result
    }

    [Windows.Devices.Radios.Radio, Windows.System.Devices, ContentType=WindowsRuntime] | Out-Null
    $radios = AwaitOp ([Windows.Devices.Radios.Radio]::GetRadiosAsync()) ([System.Collections.Generic.IReadOnlyList[Windows.Devices.Radios.Radio]])

    if (-not $radios -or $radios.Count -eq 0) {
        $result = @{
            success = $false
            state = "None"
            error = "No wireless radio adapters found on this system."
        }
        Write-Output (ConvertTo-Json $result -Compress)
        exit 0
    }

    $allOff = $true
    foreach ($r in $radios) {
        if ($r.State.ToString() -eq "On") {
            $allOff = $false
            break
        }
    }
    $currState = if ($allOff) { "On" } else { "Off" }

    if ($Action -eq "status") {
        $result = @{
            success = $true
            state = $currState
            name = "Airplane Mode"
        }
        Write-Output (ConvertTo-Json $result -Compress)
        exit 0
    }

    if ($Action -eq "on") {
        if ($currState -eq "On") {
            $result = @{
                success = $true
                state = "On"
                already = $true
                name = "Airplane Mode"
            }
            Write-Output (ConvertTo-Json $result -Compress)
            exit 0
        }

        # Turn OFF all radios to engage Airplane Mode
        foreach ($r in $radios) {
            try {
                if ($r.State.ToString() -eq "On") {
                    $null = AwaitOp ($r.SetStateAsync([Windows.Devices.Radios.RadioState]::Off)) ([Windows.Devices.Radios.RadioAccessStatus])
                }
            } catch {
                # continue other radios
            }
        }
        Start-Sleep -Milliseconds 400

        # Verify
        $verifiedAllOff = $true
        foreach ($r in $radios) {
            if ($r.State.ToString() -eq "On") {
                $verifiedAllOff = $false
                break
            }
        }

        $result = @{
            success = $true
            state = if ($verifiedAllOff) { "On" } else { "Off" }
            already = $false
            name = "Airplane Mode"
        }
        Write-Output (ConvertTo-Json $result -Compress)
        exit 0
    }

    if ($Action -eq "off") {
        if ($currState -eq "Off") {
            $result = @{
                success = $true
                state = "Off"
                already = $true
                name = "Airplane Mode"
            }
            Write-Output (ConvertTo-Json $result -Compress)
            exit 0
        }

        # Turn ON Wi-Fi radio to disengage Airplane Mode
        $wifi = $radios | Where-Object { $_.Kind -eq [Windows.Devices.Radios.RadioKind]::WiFi } | Select-Object -First 1
        if ($wifi) {
            try {
                $null = AwaitOp ($wifi.SetStateAsync([Windows.Devices.Radios.RadioState]::On)) ([Windows.Devices.Radios.RadioAccessStatus])
            } catch {}
        }
        Start-Sleep -Milliseconds 400

        $result = @{
            success = $true
            state = "Off"
            already = $false
            name = "Airplane Mode"
        }
        Write-Output (ConvertTo-Json $result -Compress)
        exit 0
    }

} catch {
    $result = @{
        success = $false
        state = "Error"
        error = $_.Exception.Message
    }
    Write-Output (ConvertTo-Json $result -Compress)
    exit 0
}
