def inc(x):
    return x + 1


def test_inc():
    assert inc(2) == 3

    assert inc(3) == 4


def test_inc2():
    assert inc(1) == 2