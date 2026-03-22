"""Tests for timeout message consistency (Bug 4 regression)"""
import pytest
import os
import re


class TestExecuteCommandTimeout:
    """Ensure timeout constant matches error message"""

    @pytest.mark.skip(reason="COMMAND_TIMEOUT_SECONDS feature not yet implemented in agent.py")
    def test_timeout_constant_defined(self):
        """COMMAND_TIMEOUT_SECONDS constant should be defined in agent.py"""
        agent_path = os.path.join(os.path.dirname(__file__), '..', 'agent.py')

        with open(agent_path, 'r') as f:
            content = f.read()

        # Check constant is defined
        assert 'COMMAND_TIMEOUT_SECONDS' in content

        # Extract the value
        match = re.search(r'COMMAND_TIMEOUT_SECONDS\s*=\s*(\d+)', content)
        assert match is not None
        timeout_value = int(match.group(1))

        # Verify it's used in subprocess.run
        assert f'timeout=COMMAND_TIMEOUT_SECONDS' in content

    @pytest.mark.skip(reason="COMMAND_TIMEOUT_SECONDS feature not yet implemented in agent.py")
    def test_timeout_message_uses_constant(self):
        """Timeout error message should reference COMMAND_TIMEOUT_SECONDS, not hardcoded value"""
        agent_path = os.path.join(os.path.dirname(__file__), '..', 'agent.py')

        with open(agent_path, 'r') as f:
            content = f.read()

        # Extract timeout constant value
        timeout_match = re.search(r'COMMAND_TIMEOUT_SECONDS\s*=\s*(\d+)', content)
        assert timeout_match is not None
        timeout_value = int(timeout_match.group(1))

        # Check the error message uses the constant
        assert f'COMMAND TIMED OUT ({timeout_value}s limit)' in content or \
               'f"COMMAND TIMED OUT ({COMMAND_TIMEOUT_SECONDS}s limit)"' in content

        # Ensure old hardcoded "30s" is NOT present in timeout message
        # (Allow "30s" in other contexts, but not in TIMED OUT message)
        timeout_expired_section = re.search(
            r'except subprocess\.TimeoutExpired:(.*?)except',
            content,
            re.DOTALL
        )
        if timeout_expired_section:
            timeout_handler = timeout_expired_section.group(1)
            # Should NOT have hardcoded "30s" in this handler
            assert 'TIMED OUT (30s limit)' not in timeout_handler
