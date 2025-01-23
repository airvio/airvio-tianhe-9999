import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const Scene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 1, 100);

    const camera = new THREE.PerspectiveCamera(
      60,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20;
    controls.maxDistance = 60;

    // 添加环境光和平行光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 创建建筑物
    const createBuilding = (x, z) => {
      const height = Math.random() * 15 + 5;
      const geometry = new THREE.BoxGeometry(4, height, 4);
      
      // 创建建筑物材质
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        flatShading: true
      });
      
      const building = new THREE.Mesh(geometry, material);
      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      return building;
    };

    // 创建城市块
    const createCityBlock = (offsetX = 0, offsetZ = 0) => {
      const block = new THREE.Group();
      const blockSize = 40;
      const buildingSpacing = 8;
      
      for (let x = -blockSize/2; x <= blockSize/2; x += buildingSpacing) {
        for (let z = -blockSize/2; z <= blockSize/2; z += buildingSpacing) {
          if (Math.random() > 0.3) { // 70% 概率生成建筑
            const building = createBuilding(x + offsetX, z + offsetZ);
            block.add(building);
          }
        }
      }
      return block;
    };

    // 创建云朵
    const createCloud = () => {
      const cloudGeometries = [];
      const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
        flatShading: true
      });

      // 创建多个球体组成一朵云
      const sphereCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < sphereCount; i++) {
        const radius = Math.random() * 2 + 1;
        const segments = 16;
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3
        );
        geometry.translate(offset.x, offset.y, offset.z);
        cloudGeometries.push(geometry);
      }

      // 合并所有球体几何体
      const mergedGeometry = mergeGeometries(cloudGeometries);
      const cloud = new THREE.Mesh(mergedGeometry, cloudMaterial);
      cloud.castShadow = true;
      return cloud;
    };

    // 创建多个云朵并添加到场景中
    const clouds = [];
    for (let i = 0; i < 20; i++) {
      const cloud = createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 100,
        30 + Math.random() * 20,
        (Math.random() - 0.5) * 100
      );
      cloud.rotation.y = Math.random() * Math.PI * 2;
      clouds.push(cloud);
      scene.add(cloud);
    }

    // 创建多个城市块
    const cityBlocks = [];
    const blockPositions = [
      { x: 0, z: 0 },
      { x: 40, z: 0 },
      { x: -40, z: 0 },
      { x: 0, z: 40 },
      { x: 0, z: -40 },
      { x: 40, z: 40 },
      { x: -40, z: -40 },
      { x: 40, z: -40 },
      { x: -40, z: 40 }
    ];

    blockPositions.forEach(pos => {
      const block = createCityBlock(pos.x, pos.z);
      cityBlocks.push(block);
      scene.add(block);
    });

    // 创建飞机
    const createAirplane = () => {
      const airplane = new THREE.Group();

      // 机身
      const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 5, 16);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.3,
        envMapIntensity: 1.0
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.z = Math.PI / 2;
      airplane.add(body);

      // 机翼
      const wingGeometry = new THREE.BoxGeometry(4, 0.15, 1.5);
      const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        metalness: 0.6,
        roughness: 0.4
      });
      const wing = new THREE.Mesh(wingGeometry, wingMaterial);
      wing.position.y = 0.2;
      airplane.add(wing);

      // 尾翼
      const tailGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.8);
      const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        metalness: 0.6,
        roughness: 0.4
      });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.x = -2;
      tail.position.y = 0.6;
      airplane.add(tail);

      // 垂直尾翼
      const verticalTailGeometry = new THREE.BoxGeometry(0.8, 1, 0.15);
      const verticalTail = new THREE.Mesh(verticalTailGeometry, tailMaterial);
      verticalTail.position.x = -1.8;
      verticalTail.position.y = 0.8;
      airplane.add(verticalTail);

      // 驾驶舱
      const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
      });
      const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
      cockpit.rotation.z = -Math.PI / 2;
      cockpit.position.x = 1;
      cockpit.position.y = 0.3;
      airplane.add(cockpit);

      airplane.castShadow = true;
      airplane.scale.set(2, 2, 2);
      return airplane;
    };

    // 创建多个飞机
    const airplanes = [];
    for (let i = 0; i < 3; i++) {
      const airplane = createAirplane();
      airplane.position.set(
        (Math.random() - 0.5) * 100,
        40 + Math.random() * 20,
        (Math.random() - 0.5) * 100
      );
      airplane.rotation.y = Math.random() * Math.PI * 2;
      airplanes.push(airplane);
      scene.add(airplane);
    }

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // 更新云朵位置
      clouds.forEach((cloud) => {
        cloud.position.x += 0.05;
        if (cloud.position.x > 50) {
          cloud.position.x = -50;
        }
        cloud.rotation.y += 0.001;
      });

      // 更新飞机位置
      airplanes.forEach((airplane) => {
        airplane.position.x += 0.2;
        airplane.position.z = 20 * Math.sin(airplane.position.x * 0.02);
        if (airplane.position.x > 50) {
          airplane.position.x = -50;
        }
        // 添加轻微的俯仰动画
        airplane.rotation.z = Math.sin(airplane.position.x * 0.1) * 0.1;
      });

      // 更新城市块位置
      const cameraPosition = new THREE.Vector3();
      camera.getWorldPosition(cameraPosition);

      cityBlocks.forEach((block, index) => {
        const pos = blockPositions[index];
        const distance = new THREE.Vector2(block.position.x - cameraPosition.x, block.position.z - cameraPosition.z).length();

        if (distance > 80) {
          const newX = ((cameraPosition.x + pos.x + 200) % 40) - 20;
          const newZ = ((cameraPosition.z + pos.z + 200) % 40) - 20;
          block.position.set(newX, 0, newZ);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Scene;