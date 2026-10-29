"""
Tests for System Fixes & Hands-Free Enhancements:
1. Setting toggles (Dark Mode, Audio Mute, Night Light, Wi-Fi, Bluetooth).
2. App closing permission, aliases, and graceful execution.
3. Launch idempotency debouncing (preventing duplicate opening of YouTube and browser).
4. Silent execution flags (CREATE_NO_WINDOW).
5. Wake listener startup script presence.
"""

import os
import subprocess
import unittest
from unittest.mock import MagicMock, patch

from assistive.command_router import CommandRouter
from assistive.automation_manager import AutomationManager, AutomationActionType, AutomationPermission, AutomationResultStatus
from assistive.system_control import SystemControl, _SILENT_FLAGS
from assistive.computer_use.media_controller import MediaController


class TestSystemSettingsCommands(unittest.TestCase):
    """Verifies basic setting commands routing and execution."""

    def setUp(self):
        self.router = CommandRouter()
        self.sys_control = SystemControl()

    def test_dark_mode_command_routing(self):
        """Verify dark mode on, off, and status routing."""
        r_on = self.router.route_intent("turn on dark mode")
        self.assertEqual(r_on["intent"], "SYSTEM_DARK_MODE")
        self.assertTrue(r_on["params"]["enabled"])

        r_off = self.router.route_intent("turn off dark mode")
        self.assertEqual(r_off["intent"], "SYSTEM_DARK_MODE")
        self.assertFalse(r_off["params"]["enabled"])

        r_light = self.router.route_intent("switch to light mode")
        self.assertEqual(r_light["intent"], "SYSTEM_DARK_MODE")
        self.assertFalse(r_light["params"]["enabled"])

        r_status = self.router.route_intent("is dark mode on")
        self.assertEqual(r_status["intent"], "SYSTEM_DARK_MODE")
        self.assertEqual(r_status["params"]["action"], "status")

    def test_audio_mute_command_routing(self):
        """Verify audio and sound mute/unmute routing via SYSTEM_VOLUME."""
        r_mute = self.router.route_intent("turn off sound")
        self.assertIn(r_mute["intent"], ("SYSTEM_VOLUME", "SYSTEM_AUDIO_MUTE"))
        if r_mute["intent"] == "SYSTEM_VOLUME":
            self.assertEqual(r_mute["params"]["action"], "mute")

        r_mute2 = self.router.route_intent("mute audio")
        self.assertIn(r_mute2["intent"], ("SYSTEM_VOLUME", "SYSTEM_AUDIO_MUTE"))
        if r_mute2["intent"] == "SYSTEM_VOLUME":
            self.assertEqual(r_mute2["params"]["action"], "mute")

        r_unmute = self.router.route_intent("turn on sound")
        self.assertIn(r_unmute["intent"], ("SYSTEM_VOLUME", "SYSTEM_AUDIO_MUTE"))
        if r_unmute["intent"] == "SYSTEM_VOLUME":
            self.assertEqual(r_unmute["params"]["action"], "unmute")

        r_unmute2 = self.router.route_intent("unmute audio")
        self.assertIn(r_unmute2["intent"], ("SYSTEM_VOLUME", "SYSTEM_AUDIO_MUTE"))
        if r_unmute2["intent"] == "SYSTEM_VOLUME":
            self.assertEqual(r_unmute2["params"]["action"], "unmute")

    def test_night_light_command_routing(self):
        """Verify night light toggle routing."""
        r_on = self.router.route_intent("turn on night light")
        self.assertEqual(r_on["intent"], "SYSTEM_NIGHT_LIGHT")
        self.assertTrue(r_on["params"]["enabled"])

        r_off = self.router.route_intent("turn off night light")
        self.assertEqual(r_off["intent"], "SYSTEM_NIGHT_LIGHT")
        self.assertFalse(r_off["params"]["enabled"])

    def test_dark_mode_execution_mocked(self):
        """Verify set_dark_mode executes registry write."""
        with patch("winreg.OpenKey") as mock_open, patch("winreg.SetValueEx") as mock_set:
            mock_open.return_value.__enter__.return_value = MagicMock()
            ok, is_dark, msg = self.sys_control.set_dark_mode(True)
            self.assertTrue(ok)
            self.assertTrue(is_dark)
            self.assertIn("Dark mode is now on", msg)

    def test_silent_subprocess_flags(self):
        """Verify _SILENT_FLAGS is set to CREATE_NO_WINDOW on Windows."""
        if os.name == "nt":
            self.assertEqual(_SILENT_FLAGS, subprocess.CREATE_NO_WINDOW)


class TestAppClosingAndAliases(unittest.TestCase):
    """Verifies that closing apps is ALLOWED and supports common aliases."""

    def setUp(self):
        self.auto = AutomationManager()

    def test_close_app_default_permission_is_allowed(self):
        """Ensure CLOSE_APP permission is ALLOWED by default (not ASK_EACH_TIME)."""
        perm = self.auto.get_permission(AutomationActionType.CLOSE_APP)
        self.assertEqual(perm, AutomationPermission.ALLOWED)

    def test_close_app_does_not_require_confirmation(self):
        """Verify create_request for CLOSE_APP requires no confirmation."""
        req = self.auto.create_request(AutomationActionType.CLOSE_APP, "notepad")
        self.assertFalse(req.requires_confirmation)

    def test_resolve_close_target_aliases(self):
        """Verify common app aliases resolve to correct process names."""
        disp, procs = self.auto.resolve_close_target("browser")
        self.assertIn("chrome.exe", procs)
        self.assertIn("msedge.exe", procs)

        disp, procs = self.auto.resolve_close_target("chrome")
        self.assertEqual(disp, "Web Browser")

        disp, procs = self.auto.resolve_close_target("notepad")
        self.assertEqual(disp, "Notepad")
        self.assertIn("notepad.exe", procs)

        disp, procs = self.auto.resolve_close_target("calculator")
        self.assertEqual(disp, "Calculator")

        disp, procs = self.auto.resolve_close_target("settings")
        self.assertEqual(disp, "Windows Settings")


class TestDuplicateLaunchDebounce(unittest.TestCase):
    """Verifies that rapid duplicate launches within 4s are suppressed."""

    def setUp(self):
        self.auto = AutomationManager()
        self.media = MediaController()

    @patch("assistive.automation_manager.subprocess.Popen")
    def test_open_app_debounce(self, mock_popen):
        """Calling open_app twice within 4s returns cached success without second Popen."""
        mock_proc = MagicMock()
        mock_proc.pid = 9999
        mock_popen.return_value = mock_proc

        req = self.auto.create_request(AutomationActionType.OPEN_APP, "calculator")
        res1 = self.auto.execute_request(req)
        self.assertEqual(res1.status, AutomationResultStatus.SUCCESS)

        # Immediate second call should be caught by debounce guard
        res2 = self.auto.execute_request(req)
        self.assertEqual(res2.status, AutomationResultStatus.SUCCESS)
        self.assertIn("already opening", res2.message)
        # Verify subprocess.Popen was only called once
        self.assertEqual(mock_popen.call_count, 1)

    @patch("webbrowser.open")
    def test_open_url_debounce(self, mock_wb_open):
        """Calling open_url twice within 4s suppresses second browser spawn."""
        req = self.auto.create_request(AutomationActionType.OPEN_URL, "https://www.youtube.com")
        res1 = self.auto.execute_request(req)
        self.assertEqual(res1.status, AutomationResultStatus.SUCCESS)

        # Immediate second call
        res2 = self.auto.execute_request(req)
        self.assertEqual(res2.status, AutomationResultStatus.SUCCESS)
        self.assertIn("already opening", res2.message)
        self.assertEqual(mock_wb_open.call_count, 1)

    @patch("urllib.request.urlopen")
    @patch("webbrowser.open")
    def test_play_media_debounce(self, mock_wb_open, mock_urlopen):
        """Calling play_media twice within 4s returns duplicate suppressed result."""
        mock_urlopen.return_value.read.return_value = b"/watch?v=dQw4w9WgXcQ"
        res1 = self.media.play_media("Believer")
        self.assertTrue(res1.success)

        # Immediate second call
        res2 = self.media.play_media("Believer")
        self.assertTrue(res2.success)
        self.assertEqual(res2.details, "Duplicate command suppressed")


class TestSilentWakeListenerStartup(unittest.TestCase):
    """Verifies that the silent background wake listener script exists."""

    def test_silent_vbs_exists(self):
        vbs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "run_wake_listener_silent.vbs")
        self.assertTrue(os.path.exists(vbs_path), f"File not found: {vbs_path}")




class TestCloseAppAndSettingsAccessibility(unittest.TestCase):
    """Verifies that closing apps and settings do not trigger voice security challenges."""

    @classmethod
    def setUpClass(cls):
        from assistive.vision_engine import VisionEngine
        cls.engine = VisionEngine(data_dir="data")

    def test_close_app_does_not_trigger_voice_auth(self):
        from assistive.conversation_context import ConversationState
        from assistive.security_manager import SecurityState

        res = self.engine.process_user_speech_query("close browser")
        self.assertNotIn("voice password", res.lower())
        self.assertNotIn("protected action", res.lower())
        self.assertTrue("closed" in res.lower() or "nothing to close" in res.lower())
        self.assertNotEqual(self.engine.context.state, ConversationState.SECURITY_CHALLENGE)
        self.assertEqual(self.engine.security.current_state, SecurityState.IDLE)

    def test_close_notepad_does_not_trigger_voice_auth(self):
        from assistive.conversation_context import ConversationState
        from assistive.security_manager import SecurityState

        res = self.engine.process_user_speech_query("close notepad")
        self.assertNotIn("voice password", res.lower())
        self.assertNotIn("protected action", res.lower())
        self.assertTrue("closed" in res.lower() or "nothing to close" in res.lower())
        self.assertNotEqual(self.engine.context.state, ConversationState.SECURITY_CHALLENGE)
        self.assertEqual(self.engine.security.current_state, SecurityState.IDLE)

    def test_settings_routing(self):
        for phrase in ["open settings", "open main settings", "settings"]:
            res = self.engine.process_user_speech_query(phrase)
            self.assertIsNotNone(res)
            self.assertIn("settings", res.lower())

    def test_quick_settings_toggles(self):
        res_dark = self.engine.process_user_speech_query("turn on dark mode")
        self.assertIn("dark mode", res_dark.lower())

        res_mute = self.engine.process_user_speech_query("turn off sound")
        self.assertIn("muted", res_mute.lower())


if __name__ == "__main__":
    unittest.main()
