let vantaEffect = VANTA.GLOBE({
    el: "#vanta-canvas",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x1a1316,
    color2: 0x0,
    backgroundColor: 0xbabac2
});

window.addEventListener('resize', () => {
    if (vantaEffect) {
        vantaEffect.resize();
    }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if(u === "admin" && p === "1234") {
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('error').classList.remove('d-none');
    }
});

