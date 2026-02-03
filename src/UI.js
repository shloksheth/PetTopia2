class UI {
    static centerX(scene) {
        return scene.scale.width / 2;
    }

    static centerY(scene) {
        return scene.scale.height / 2;
    }

    static top(offset = 0) {
        return offset;
    }

    static bottom(scene, offset = 0) {
        return scene.scale.height - offset;
    }
}
