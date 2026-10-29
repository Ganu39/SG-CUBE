using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace SGCubeWakeLauncher
{
    static class Program
    {
        private const string MUTEX_NAME = "Local\\SG_CUBE_WAKE_LISTENER_MUTEX";

        [STAThread]
        static void Main(string[] args)
        {
            bool createdNew;
            using (Mutex mutex = new Mutex(true, MUTEX_NAME, out createdNew))
            {
                if (!createdNew)
                {
                    // Wake listener already running
                    return;
                }

                string appDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');

                string pythonExe = ResolvePythonRuntime(appDir);
                if (string.IsNullOrEmpty(pythonExe) || !File.Exists(pythonExe))
                {
                    return;
                }

                string scriptPath = Path.Combine(appDir, "wake_listener.py");
                if (!File.Exists(scriptPath))
                {
                    return;
                }

                StringBuilder argBuilder = new StringBuilder();
                argBuilder.AppendFormat("\"{0}\"", scriptPath);
                foreach (string arg in args)
                {
                    argBuilder.Append(" ");
                    if (arg.Contains(" ") && !arg.StartsWith("\""))
                    {
                        argBuilder.AppendFormat("\"{0}\"", arg);
                    }
                    else
                    {
                        argBuilder.Append(arg);
                    }
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = pythonExe;
                psi.Arguments = argBuilder.ToString();
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                psi.EnvironmentVariables["PYTHONUNBUFFERED"] = "1";
                psi.EnvironmentVariables["PYTHONIOENCODING"] = "utf-8";

                try
                {
                    using (Process proc = Process.Start(psi))
                    {
                        if (proc != null)
                        {
                            proc.WaitForExit();
                        }
                    }
                }
                catch
                {
                    // Background daemon
                }
            }
        }

        private static string ResolvePythonRuntime(string appDir)
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string installedDir = Path.Combine(localAppData, "Programs", "SG-CUBE");

            string[] candidates = new string[]
            {
                Path.Combine(appDir, ".venv", "Scripts", "pythonw.exe"),
                Path.Combine(appDir, "runtime", "Scripts", "pythonw.exe"),
                Path.Combine(appDir, "runtime", "pythonw.exe"),
                Path.Combine(appDir, ".venv", "Scripts", "python.exe"),
                Path.Combine(appDir, "runtime", "Scripts", "python.exe"),
                Path.Combine(appDir, "runtime", "python.exe"),

                Path.Combine(installedDir, ".venv", "Scripts", "pythonw.exe"),
                Path.Combine(installedDir, "runtime", "Scripts", "pythonw.exe"),
                Path.Combine(installedDir, "runtime", "pythonw.exe"),
                Path.Combine(installedDir, ".venv", "Scripts", "python.exe"),
                Path.Combine(installedDir, "runtime", "Scripts", "python.exe"),
                Path.Combine(installedDir, "runtime", "python.exe"),
            };

            foreach (string candidate in candidates)
            {
                if (File.Exists(candidate))
                {
                    return candidate;
                }
            }

            string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
            string[] paths = pathEnv.Split(Path.PathSeparator);

            foreach (string dir in paths)
            {
                if (string.IsNullOrEmpty(dir)) continue;
                string pw = Path.Combine(dir, "pythonw.exe");
                if (File.Exists(pw)) return pw;
            }

            foreach (string dir in paths)
            {
                if (string.IsNullOrEmpty(dir)) continue;
                string p = Path.Combine(dir, "python.exe");
                if (File.Exists(p)) return p;
            }

            return null;
        }
    }
}
