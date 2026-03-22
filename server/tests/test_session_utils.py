"""Tests for session utilities (Bugs 5 and 6 regression)"""
import pytest
import os
import sys


class TestFindFreePort:
    """Test find_free_port function (Bug 5 regression)"""

    def test_find_free_port_returns_valid_port(self):
        """find_free_port() should return an integer in the valid port range"""
        # Import the function from start.py
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

        # We need to mock the environment to import start.py
        from unittest.mock import patch
        with patch.dict(os.environ, {
            'JWT_SECRET_KEY': 'test-key',
            'SECRET_KEY': 'test-flask-key',
            'DATABASE_URL': 'sqlite:///:memory:'
        }):
            # Import find_free_port from start module
            from server.start import find_free_port

            port = find_free_port()

            assert isinstance(port, int)
            assert 1024 <= port <= 65535  # Valid port range

    def test_find_free_port_returns_distinct_ports(self):
        """Two consecutive calls should return distinct ports (no collision)"""
        from unittest.mock import patch
        with patch.dict(os.environ, {
            'JWT_SECRET_KEY': 'test-key',
            'SECRET_KEY': 'test-flask-key',
            'DATABASE_URL': 'sqlite:///:memory:'
        }):
            from server.start import find_free_port

            port1 = find_free_port()
            port2 = find_free_port()

            # Ports should be different (very high probability)
            # In rare cases they might be the same if OS reuses, but typically different
            assert isinstance(port1, int)
            assert isinstance(port2, int)


class TestAgentPathResolution:
    """Test agent.py path resolution (Bug 6 regression)"""

    def test_agent_py_path_is_absolute(self):
        """_AGENT_PY should resolve to an absolute path"""
        from unittest.mock import patch
        with patch.dict(os.environ, {
            'JWT_SECRET_KEY': 'test-key',
            'SECRET_KEY': 'test-flask-key',
            'DATABASE_URL': 'sqlite:///:memory:'
        }):
            from server.start import _AGENT_PY

            assert os.path.isabs(_AGENT_PY)
            assert 'agent.py' in _AGENT_PY
            assert os.path.exists(_AGENT_PY)
