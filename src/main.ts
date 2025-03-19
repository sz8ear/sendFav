import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ⭐️ ぼかし（発光）エフェクトの設定
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 🔥 UnrealBloomPass（光の広がり）
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // ⭐️ 強さ（光の強さ）
  0.4, // ⭐️ 半径（光の広がり）
  0.85 // ⭐️ しきい値（どの明るさから光るか）
);
composer.addPass(bloomPass);

// 環境光（少し控えめ）
const light = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light);

// 星の数を設定
const STAR_COUNT = 100;
const stars: {
  mesh: THREE.Object3D;
  rotationSpeed: THREE.Vector3;
  scaleSpeed: number;
  baseScale: number;
}[] = [];

// ⭐️ ロードする星のファイルリスト
const starFiles = [
  "/star_light_blue.glb",
  "/star_pink.glb",
  "/star_purple.glb",
];

const loader = new GLTFLoader();
const starModels: THREE.Object3D[] = [];

starFiles.forEach((file, index) => {
  loader.load(
    file,
    (gltf) => {
      const star = gltf.scene;

      // ⭐️ 既存のマテリアルを維持しつつ発光を適用（全ての星に適用）
      star.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const originalMaterial = mesh.material as THREE.MeshStandardMaterial;

          if (originalMaterial) {
            const glowingMaterial = new THREE.MeshStandardMaterial({
              color: originalMaterial.color,
              emissive: originalMaterial.color, // ⭐️ 元の色を活かして発光
              emissiveIntensity: file.includes("purple")
                ? 6.5
                : file.includes("pink")
                ? 1.9
                : 1.4, // ⭐️ 発光強度を上げる
              metalness: 0, // ⭐️ メタル感をなくす
              roughness: 0.5, // ⭐️ 反射を少し持たせる
              transparent: true,
              opacity: 1.0,
            });

            mesh.material = glowingMaterial;
          }
        }
      });

      starModels[index] = star;

      // 全ての星がロードされたらシーンに追加
      if (starModels.length === starFiles.length) {
        createStars();
      }
    },
    undefined,
    (error) => console.error(`GLTF 読み込みエラー: ${file}`, error)
  );
});

// ⭐️ 星をランダムに配置する関数
function createStars() {
  for (let i = 0; i < STAR_COUNT; i++) {
    // ⭐️ 3種類の星からランダムに選ぶ
    const randomStar =
      starModels[Math.floor(Math.random() * starModels.length)].clone();

    // ランダムな座標に配置
    const x = (Math.random() - 0.5) * 100; // -50 から +50 の範囲
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    randomStar.position.set(x, y, z);

    // ランダムな基本サイズ（大きい星を増やす）
    const baseScale = Math.random() * 2.0 + 1.0; // 1.0 〜 3.0 の範囲
    randomStar.scale.set(baseScale, baseScale, baseScale);

    // ランダムな回転速度
    const rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );

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
    starObj.mesh.scale.set(
      starObj.baseScale * scaleFactor,
      starObj.baseScale * scaleFactor,
      starObj.baseScale * scaleFactor
    );
  });

  // 🔥 発光（ぼかし）エフェクト付きのレンダリング
  composer.render();
}
animate();
