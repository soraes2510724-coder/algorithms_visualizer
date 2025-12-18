let array = [];
let delayTime = 800;
let isSorting = false;
let stopFlag = false;

// 배열 생성
function generateArray() {
	if (isSorting) return;
	const countInput = document.getElementById('boxCount');
	let count = parseInt(countInput.value);
	if (count < 5) count = 5;
	if (count > 10) count = 10;
	countInput.value = count;

	array = [];
	const container = document.getElementById('container');
	container.innerHTML = '';
	addLog('새로운 배열이 생성되었습니다.', 'highlight');

	for (let i = 0; i < count; i++) {
		const val = Math.floor(Math.random() * 50) + 1;
		array.push(val);

		const containerDiv = document.createElement('div');
		containerDiv.className = 'box-container';
		containerDiv.id = `wrapper-${i}`;

		const box = document.createElement('div');
		box.className = 'box';
		box.id = `box-${i}`;
		box.innerText = val;

		const label = document.createElement('div');
		label.className = 'label';
		label.id = `label-${i}`;

		containerDiv.appendChild(box);
		containerDiv.appendChild(label);
		container.appendChild(containerDiv);
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function updateSpeed() {
	const val = document.getElementById('speedRange').value;
	delayTime = 1600 - val; 
	const display = document.getElementById('speedDisplay');
	if(delayTime < 400) display.innerText = "Max";
	else if(delayTime > 1000) display.innerText = "Slow";
	else display.innerText = "Normal";
}

function addLog(msg, type = 'normal') {
	const panel = document.getElementById('logPanel');
	const entry = document.createElement('div');
	entry.className = 'log-entry';
	if(type === 'highlight') entry.classList.add('log-highlight');

	entry.innerHTML = `> ${msg}`;
	panel.appendChild(entry);
	panel.scrollTop = panel.scrollHeight;
}

function updateVisualState(pivotIdx, leftIdx, rightIdx) {
	for (let i = 0; i < array.length; i++) {
		const box = document.getElementById(`box-${i}`);
		const label = document.getElementById(`label-${i}`);

		if (!box.classList.contains('fixed')) {
			box.className = 'box'; 
		}
		label.innerHTML = '';
		label.className = 'label';
	}

	if (pivotIdx !== null && pivotIdx >= 0) {
		const pBox = document.getElementById(`box-${pivotIdx}`);
		const pLabel = document.getElementById(`label-${pivotIdx}`);
		if(!pBox.classList.contains('fixed')) {
			pBox.classList.add('pivot');
			pLabel.innerHTML = 'PIVOT';
			pLabel.classList.add('p-text');
		}
	}

	if (leftIdx !== null && leftIdx < array.length) {
		const lBox = document.getElementById(`box-${leftIdx}`);
		const lLabel = document.getElementById(`label-${leftIdx}`);
		if(!lBox.classList.contains('fixed')) {
			lBox.classList.add('left');
			let txt = lLabel.innerHTML;
			lLabel.innerHTML = txt ? txt + '<br>Left' : 'Left';
			lLabel.classList.add('l-text');
		}
	}

	if (rightIdx !== null && rightIdx >= 0) {
		const hBox = document.getElementById(`box-${rightIdx}`);
		const hLabel = document.getElementById(`label-${rightIdx}`);
		if(!hBox.classList.contains('fixed')) {
			hBox.classList.add('right');
			let txt = hLabel.innerHTML;
			hLabel.innerHTML = txt ? txt + '<br>Right' : 'Right';
			hLabel.classList.add('h-text');
		}
	}
}

// 물리적 교환 애니메이션
async function swapAnimate(idx1, idx2) {
	if (idx1 === idx2) return;

	const box1 = document.getElementById(`box-${idx1}`);
	const box2 = document.getElementById(`box-${idx2}`);

	const rect1 = box1.getBoundingClientRect();
	const rect2 = box2.getBoundingClientRect();
	const distance = rect2.left - rect1.left;

	box1.style.transform = `translateX(${distance}px)`;
	box2.style.transform = `translateX(${-distance}px)`;
	box1.style.zIndex = 100;
	box2.style.zIndex = 100;

	await sleep(delayTime);

	let temp = array[idx1];
	array[idx1] = array[idx2];
	array[idx2] = temp;

	box1.innerText = array[idx1];
	box2.innerText = array[idx2];

	box1.style.transition = 'none';
	box2.style.transition = 'none';
	box1.style.transform = 'translateX(0)';
	box2.style.transform = 'translateX(0)';
	box1.style.zIndex = '';
	box2.style.zIndex = '';

	box1.offsetHeight; 

	await sleep(50);
	box1.style.transition = ''; 
	box2.style.transition = '';
}

function stopSort() {
	if(isSorting) {
		stopFlag = true;
		addLog("사용자에 의해 중단되었습니다.", "highlight");
	}
}

async function startSort(type) {
	let currentSort = type;
	if (array.length === 0) generateArray();
	if (isSorting) return;

	isSorting = true;
	stopFlag = false;

	document.getElementById('startBtn').disabled = true;
	document.getElementById('stopBtn').disabled = false;
	document.getElementById('boxCount').disabled = true;


	addLog(`${currentSort} Sort 시작`, "highlight");

	switch (currentSort) {
		case 'Bubble':
			await bubbleSort();
			break;
		case 'Selection':
			await selectionSort();
			break;
		case 'Insertion':
			await insertionSort();
			break;
		case 'Merge':
			await mergeSort(0, array.length - 1);
			break;
		case 'Heap':
			await heapSort();
			break;
		default:
			await quickSort(0, array.length - 1);
	}

	if(!stopFlag) {
		addLog("정렬 완료!", "highlight");
		updateVisualState(null, null, null);
	}

	isSorting = false;
	document.getElementById('startBtn').disabled = false;
	document.getElementById('stopBtn').disabled = true;
	document.getElementById('boxCount').disabled = false;
}

async function bubbleSort() {
	const n = array.length;

	for (let i = 0; i < n - 1; i++) {
		for (let j = 0; j < n - i - 1; j++) {
			if (stopFlag) return;

			updateVisualState(null, j, j + 1);
			await sleep(delayTime / 2);

			if (array[j] > array[j + 1]) {
				addLog(`교환: ${array[j]} ↔ ${array[j + 1]}`);
				await swapAnimate(j, j + 1);
			}
		}
		document.getElementById(`box-${n - i - 1}`).classList.add('fixed');
	}
}

async function selectionSort() {
	const n = array.length;

	for (let i = 0; i < n; i++) {
		let minIdx = i;

		for (let j = i + 1; j < n; j++) {
			if (stopFlag) return;

			updateVisualState(null, minIdx, j);
			await sleep(delayTime / 2);

			if (array[j] < array[minIdx]) {
				minIdx = j;
			}
		}

		if (minIdx !== i) {
			addLog(`최소값 교환: ${array[i]} ↔ ${array[minIdx]}`);
			await swapAnimate(i, minIdx);
		}

		document.getElementById(`box-${i}`).classList.add('fixed');
	}
}

async function insertionSort() {
	const n = array.length;

	for (let i = 1; i < n; i++) {
		let j = i;

		while (j > 0 && array[j - 1] > array[j]) {
			if (stopFlag) return;

			updateVisualState(null, j - 1, j);
			addLog(`삽입 이동: ${array[j - 1]} → 오른쪽`);
			await swapAnimate(j - 1, j);
		j--;
		}
	}

	for (let i = 0; i < n; i++) {
		document.getElementById(`box-${i}`).classList.add('fixed');
	}
}

async function mergeSort(left, right) {
	if (stopFlag || left >= right) return;

	const mid = Math.floor((left + right) / 2);

	await mergeSort(left, mid);
	await mergeSort(mid + 1, right);
	await merge(left, mid, right);
}

async function merge(left, mid, right) {
	let temp = [];
	let i = left, j = mid + 1;

	while (i <= mid && j <= right) {
		if (stopFlag) return;

		if (array[i] <= array[j]) temp.push(array[i++]);
		else temp.push(array[j++]);
	}

	while (i <= mid) temp.push(array[i++]);
	while (j <= right) temp.push(array[j++]);

	for (let k = 0; k < temp.length; k++) {
		if (stopFlag) return;

		array[left + k] = temp[k];
		document.getElementById(`box-${left + k}`).innerText = temp[k];
		updateVisualState(null, left + k, null);
		await sleep(delayTime / 2);
	}

	if (right - left === array.length - 1) {
		for (let i = 0; i < array.length; i++) {
			document.getElementById(`box-${i}`).classList.add('fixed');
		}
	}
}

async function heapSort() {
	const n = array.length;

	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		await heapify(n, i);
	}

	for (let i = n - 1; i > 0; i--) {
		if (stopFlag) return;

		await swapAnimate(0, i);
		document.getElementById(`box-${i}`).classList.add('fixed');
		await heapify(i, 0);
	}

	document.getElementById(`box-0`).classList.add('fixed');
}

async function heapify(n, i) {
	let largest = i;
	let l = 2 * i + 1;
	let r = 2 * i + 2;

	if (l < n && array[l] > array[largest]) largest = l;
	if (r < n && array[r] > array[largest]) largest = r;

	if (largest !== i) {
		await swapAnimate(i, largest);
		await heapify(n, largest);
	}
}

async function quickSort(start, end) {
	if (stopFlag) return;

	if (start >= end) {
		if (start === end) {
			document.getElementById(`box-${start}`).classList.add('fixed');
		}
		return;
	}

	let pivotIndex = await partition(start, end);

	if (stopFlag) return;

	await quickSort(start, pivotIndex - 1);
	await quickSort(pivotIndex + 1, end);
}

async function partition(start, end) {
	if (stopFlag) return start;

	let pivot = array[start];
	let low = start + 1;
	let high = end;

	addLog(`Pivot 설정: ${pivot}`, "highlight");
	updateVisualState(start, low, high);
	await sleep(delayTime);

	while (low <= high) {
		if (stopFlag) return start;

		while (low <= end && array[low] <= pivot) {
			if (stopFlag) return start;
			low++;
			updateVisualState(start, low, high);
			await sleep(delayTime / 3);
		}

		while (high > start && array[high] >= pivot) {
			if (stopFlag) return start;
			high--;
			updateVisualState(start, low, high);
			await sleep(delayTime / 3);
		}

		if (low > high) {
			addLog(`교차됨 (Low > High)`);
			updateVisualState(start, low, high);
			await sleep(delayTime);
		} else {
			addLog(`교환: ${array[low]} <-> ${array[high]}`);
			await swapAnimate(low, high);
			updateVisualState(start, low, high);
		}
	}

	if (stopFlag) return start;

	addLog(`Pivot(${array[start]}) 위치 확정`);
	await swapAnimate(start, high);

	document.getElementById(`box-${high}`).classList.add('fixed');
	return high;
}

generateArray();
