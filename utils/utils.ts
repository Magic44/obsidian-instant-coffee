export function hexToRgba(hex: string, alpha: string) {
	// 移除可能存在的井号(#)
	let hexValue = hex.replace('#', '');

	// 检查十六进制颜色值是否有效
	if (hexValue.length !== 6) {
		throw new Error('Invalid hex color value');
	}

	// 将十六进制颜色值分割成RGB组件
	let r = parseInt(hexValue.substring(0, 2), 16);
	let g = parseInt(hexValue.substring(2, 4), 16);
	let b = parseInt(hexValue.substring(4, 6), 16);

	// 返回rgba格式的颜色值
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
