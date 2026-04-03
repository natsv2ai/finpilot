"""
Broker Registry — Dynamic, config-driven broker management.
Any broker that extends BrokerBase can self-register here.
"""

from typing import Type
from app.services.brokers.broker_base import BrokerBase, BrokerConfig


# Global registry: broker_name → BrokerBase subclass
_BROKER_CLASSES: dict[str, Type[BrokerBase]] = {}


def register_broker(broker_class: Type[BrokerBase]):
    """Register a broker class. Used as a decorator on broker implementations."""
    # Create a temporary instance to get the broker_name
    dummy_config = BrokerConfig(name="__dummy__")
    try:
        instance = broker_class(dummy_config)
        name = instance.broker_name
    except Exception:
        name = broker_class.__name__.lower().replace("broker", "")
    _BROKER_CLASSES[name] = broker_class
    return broker_class


def get_broker(name: str, config: BrokerConfig) -> BrokerBase:
    """Instantiate a broker by name with the given config."""
    name = name.lower()
    if name not in _BROKER_CLASSES:
        raise ValueError(
            f"Unknown broker: '{name}'. Available: {', '.join(_BROKER_CLASSES.keys())}"
        )
    return _BROKER_CLASSES[name](config)


def list_brokers() -> list[dict]:
    """List all registered brokers with metadata."""
    result = []
    for name, cls in _BROKER_CLASSES.items():
        dummy = cls(BrokerConfig(name=name))
        result.append({
            "key": name,
            "display_name": dummy.display_name,
            "auth_type": dummy.auth_type,
        })
    return result


def is_registered(name: str) -> bool:
    return name.lower() in _BROKER_CLASSES


# Auto-import all broker implementations to trigger registration
def _auto_discover():
    try:
        from app.services.brokers import upstox, zerodha, groww, angelone  # noqa: F401
    except ImportError:
        pass


_auto_discover()
