from kinematics import Point, calculate_angle


def test_straight_angle():
    a = Point(-1, 0)
    b = Point(0, 0)
    c = Point(1, 0)
    assert abs(calculate_angle(a, b, c) - 180.0) < 1e-6


def test_right_angle():
    a = Point(0, 1)
    b = Point(0, 0)
    c = Point(1, 0)
    assert abs(calculate_angle(a, b, c) - 90.0) < 1e-6
