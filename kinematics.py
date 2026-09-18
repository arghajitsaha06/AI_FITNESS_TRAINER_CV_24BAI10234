from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0


def calculate_angle(a: Point, b: Point, c: Point) -> float:
    """Return the smaller 2D angle ABC in degrees, in [0, 180]."""
    angle1 = math.atan2(c.y - b.y, c.x - b.x)
    angle2 = math.atan2(a.y - b.y, a.x - b.x)
    angle = abs(angle1 - angle2) * 180.0 / math.pi
    if angle > 180.0:
        angle = 360.0 - angle
    return angle


def horizontal_distance(a: Point, b: Point) -> float:
    return abs(a.x - b.x)


def euclidean_2d(a: Point, b: Point) -> float:
    return math.hypot(a.x - b.x, a.y - b.y)
