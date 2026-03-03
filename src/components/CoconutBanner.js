'use client'; // для Next.js App Router

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CoconutBanner = ({ className = '', style = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const coconutGroupRef = useRef(null);
  const frameRef = useRef(null);
  const hoverRef = useRef(false); // флаг наведения
  const mouseRef = useRef({ x: 0, y: 0 }); // координаты мыши для взгляда

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Сцена ---
    const scene = new THREE.Scene();
    // Убираем жесткий фон, чтобы использовать прозрачность
    // scene.background = new THREE.Color(0x87CEEB); 

    // --- Камера ---
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 5); // Прямой взгляд
    camera.lookAt(0, 0.5, 0);

    // --- Рендерер ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Очищаем контейнер перед добавлением, чтобы избежать дублей
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // --- Освещение ---
    // Основной свет (солнце)
    const sunLight = new THREE.DirectionalLight(0xfff5d1, 1.2);
    sunLight.position.set(3, 5, 4);
    sunLight.castShadow = true;
    sunLight.receiveShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    const d = 4;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 10;
    scene.add(sunLight);

    // Заполняющий свет
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    // Подсветка снизу
    const fillLight = new THREE.PointLight(0x88aaff, 0.5);
    fillLight.position.set(-1, 1, 2);
    scene.add(fillLight);

    // --- Создание текстур (волокнистость) ---
    function createCoconutTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Базовый цвет (насыщенный коричневый)
      ctx.fillStyle = '#6d4122';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Добавляем "волокна" (линии)
      for (let i = 0; i < 2000; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? '#8b5a2b' : '#4a2c1a';
        ctx.lineWidth = Math.random() * 2;
        ctx.globalAlpha = Math.random() * 0.5;
        ctx.beginPath();
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 200);
        ctx.stroke();
      }
      
      // "Шершавые" пятна
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = '#3e2413';
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    }

    const coconutTexture = createCoconutTexture();

    // --- Группа кокоса (будем вращать её) ---
    const coconutGroup = new THREE.Group();
    coconutGroup.position.y = 0.5;

    // === Тело кокоса ===
    const bodyGeo = new THREE.SphereGeometry(1, 64, 48);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: coconutTexture,
      bumpMap: coconutTexture,
      bumpScale: 0.15,
      roughness: 0.85,
      metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.05, 1.25, 1.05); // более вытянутый, как настоящий кокос
    body.castShadow = true;
    body.receiveShadow = true;
    coconutGroup.add(body);

    // === Процедурные ворсинки (Hairs) ===
    const hairMat = new THREE.LineBasicMaterial({ color: 0x4a2c1a, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      
      const start = new THREE.Vector3(x, y * 1.2, z);
      const end = start.clone().multiplyScalar(1.05 + Math.random() * 0.05);
      
      const hairGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const hair = new THREE.Line(hairGeo, hairMat);
      coconutGroup.add(hair);
    }

    // === Три тёмных пятна (на макушке) ===
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x4a2c1a });
    const positions = [
      [0.3, 0.8, 0.4],
      [-0.3, 0.8, 0.3],
      [0.0, 0.7, -0.5]
    ];
    positions.forEach(pos => {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16), spotMat);
      spot.position.set(pos[0], pos[1], pos[2]);
      spot.scale.set(1.2, 0.7, 0.9);
      spot.castShadow = true;
      coconutGroup.add(spot);
    });

    // === Глаза ===
    // Белки
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24), eyeWhiteMat);
    leftEye.position.set(-0.45, 0.35, 1.0); // выше и плотнее к поверхности
    leftEye.scale.set(0.7, 0.6, 0.1); // очень тонкий белок
    leftEye.castShadow = true;
    coconutGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24), eyeWhiteMat);
    rightEye.position.set(0.45, 0.35, 1.0); // выше и плотнее к поверхности
    rightEye.scale.set(0.7, 0.6, 0.1);
    rightEye.castShadow = true;
    coconutGroup.add(rightEye);

    // Зрачки
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16), pupilMat);
    leftPupil.position.set(-0.45, 0.35, 1.06);
    leftPupil.scale.set(0.6, 0.6, 0.1);
    leftPupil.castShadow = true;
    coconutGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16), pupilMat);
    rightPupil.position.set(0.45, 0.35, 1.06);
    rightPupil.scale.set(0.6, 0.6, 0.1);
    rightPupil.castShadow = true;
    coconutGroup.add(rightPupil);

    const initialPupilPositions = {
      left: new THREE.Vector3(-0.45, 0.35, 1.06),
      right: new THREE.Vector3(0.45, 0.35, 1.06)
    };

    // === Рот (улыбка) ===
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.3, -0.2, 0.95),
        new THREE.Vector3(0, -0.4, 1.05),
        new THREE.Vector3(0.3, -0.2, 0.95)
    );
    const mouthGeo = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x2a160a });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    coconutGroup.add(mouth);

    // === Руки ===
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x6B4A2C });

    // Левая рука
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), limbMat);
    leftArm.position.set(-0.95, 0.3, 0); // смещаем точно вбок
    leftArm.rotation.z = Math.PI / 2.5; 
    leftArm.castShadow = true;
    coconutGroup.add(leftArm);

    // Кисть левой руки
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12), limbMat);
    leftHand.position.set(-1.3, 0.2, 0.2);
    leftHand.castShadow = true;
    coconutGroup.add(leftHand);

    // Правая рука
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), limbMat);
    rightArm.position.set(0.95, 0.3, 0); 
    rightArm.rotation.z = -Math.PI / 2.5;
    rightArm.castShadow = true;
    coconutGroup.add(rightArm);

    // Кисть правой руки
    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12), limbMat);
    rightHand.position.set(1.3, 0.2, 0.2);
    rightHand.castShadow = true;
    coconutGroup.add(rightHand);

    // === Ноги ===
    // Левая нога
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), limbMat);
    leftLeg.position.set(-0.5, -0.8, 0.1);
    leftLeg.castShadow = true;
    coconutGroup.add(leftLeg);

    // Ступня левая
    const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8), limbMat);
    leftFoot.position.set(-0.6, -1.05, 0.2);
    leftFoot.scale.set(1.2, 0.5, 0.8);
    leftFoot.castShadow = true;
    coconutGroup.add(leftFoot);

    // Правая нога
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), limbMat);
    rightLeg.position.set(0.5, -0.8, 0.1);
    rightLeg.castShadow = true;
    coconutGroup.add(rightLeg);

    // Ступня правая
    const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8), limbMat);
    rightFoot.position.set(0.6, -1.05, 0.2);
    rightFoot.scale.set(1.2, 0.5, 0.8);
    rightFoot.castShadow = true;
    coconutGroup.add(rightFoot);

    scene.add(coconutGroup);

    // --- Пол / платформа (для тени) ---
    const planeGeo = new THREE.CircleGeometry(3, 32);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x5a8c5a, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.9;
    plane.receiveShadow = true;
    scene.add(plane);

    // Сохраняем ссылки
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    coconutGroupRef.current = coconutGroup;

    // --- Обработчики наведения и движения ---
    const canvas = renderer.domElement;
    const handleMouseMove = (e) => {
      // Глобальные координаты для отслеживания по всему экрану
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', () => (hoverRef.current = true));
    canvas.addEventListener('mouseleave', () => {
      hoverRef.current = false;
      // Взгляд теперь не сбрасываем в 0 при уходе с баннера, 
      // так как пользователь просил следить везде.
    });

    // --- Анимация ---
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      if (coconutGroupRef.current) {
        // Плавное парение (bobbing)
        coconutGroupRef.current.position.y = 0.5 + Math.sin(time) * 0.05;
        
        // Кокос смотрит прямо на пользователя
        coconutGroupRef.current.rotation.y = 0; 
        
        // Легкий наклон удаляем или минимизируем
        coconutGroupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;

        // зрачки следят
        const eyeMovementScale = 0.08; 
        leftPupil.position.x = initialPupilPositions.left.x + (mouseRef.current.x * eyeMovementScale);
        leftPupil.position.y = initialPupilPositions.left.y + (mouseRef.current.y * eyeMovementScale);
        
        rightPupil.position.x = initialPupilPositions.right.x + (mouseRef.current.x * eyeMovementScale);
        rightPupil.position.y = initialPupilPositions.right.y + (mouseRef.current.y * eyeMovementScale);
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- Обработка ресайза ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // --- Очистка при размонтировании ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      
      // Глубокая очистка Three.js
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }} />;
};

export default CoconutBanner;