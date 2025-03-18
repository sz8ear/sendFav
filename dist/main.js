import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// ⭐️ ぼかし（発光）エフェクトの設定
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, // 強さ
0.4, // 半径
0.85 // しきい値
);
composer.addPass(bloomPass);
// 環境光
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
// 星の数を設定
const STAR_COUNT = 100;
const stars = [];
// ⭐️ ロードする星のファイルリスト
const starFiles = [
    "/star_light_blue.glb",
    "/star_pink.glb",
    "/star_yellow.glb",
];
const loader = new GLTFLoader();
// ⭐️ 3種類の星をロード
const starModels = [];
starFiles.forEach((file, index) => {
    loader.load(file, (gltf) => {
        starModels[index] = gltf.scene;
        // 全ての星がロードされたらシーンに追加
        if (starModels.length === starFiles.length) {
            createStars();
        }
    }, undefined, (error) => console.error(`GLTF 読み込みエラー: ${file}`, error));
});
// ⭐️ 星をランダムに配置する関数
function createStars() {
    for (let i = 0; i < STAR_COUNT; i++) {
        // ⭐️ 3種類の星からランダムに選ぶ
        const randomStar = starModels[Math.floor(Math.random() * starModels.length)].clone();
        // ランダムな座標に配置
        const x = (Math.random() - 0.5) * 100; // -50 から +50 の範囲
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        randomStar.position.set(x, y, z);
        // ランダムな基本サイズ（大きい星を増やす）
        const baseScale = Math.random() * 2.0 + 1.0; // 1.0 〜 3.0 の範囲
        randomStar.scale.set(baseScale, baseScale, baseScale);
        // ランダムな回転速度
        const rotationSpeed = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
        // ランダムな拡縮速度
        const scaleSpeed = Math.random() * 0.05 + 0.02; // 0.02 〜 0.07 の範囲
        // 配列に追加
        stars.push({ mesh: randomStar, rotationSpeed, scaleSpeed, baseScale });
        // シーンに追加
        scene.add(randomStar);
    }
}
// アニメーションループ
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.02; // 時間の進行
    // すべての星を回転＆拡縮
    stars.forEach((starObj) => {
        starObj.mesh.rotation.x += starObj.rotationSpeed.x;
        starObj.mesh.rotation.y += starObj.rotationSpeed.y;
        starObj.mesh.rotation.z += starObj.rotationSpeed.z;
        // `Math.sin` を利用してサイズを周期的に変化させる
        const scaleFactor = Math.sin(time * starObj.scaleSpeed) * 0.3 + 1.0;
        starObj.mesh.scale.set(starObj.baseScale * scaleFactor, starObj.baseScale * scaleFactor, starObj.baseScale * scaleFactor);
    });
    // 🔥 発光（ぼかし）エフェクト付きのレンダリング
    composer.render();
}
animate();
// ウィンドウサイズ変更時の対応
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
