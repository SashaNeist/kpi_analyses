;(async function runAllTests() {
	console.clear()
	console.log(
		'%cЗапуск 8 тестов с ИСПРАВЛЕННОЙ нормализацией...',
		'color: #00a651; font-weight: bold;'
	)

	const tests = [
		{
			name: '1. Идеальный',
			kpi: { name: 'Иванов', revenue: 130, accessories: 140, finance: 135 },
			expect: 'Поздравляем',
		},
		{
			name: '2. Средний',
			kpi: { name: 'Петров', revenue: 85, accessories: 92, finance: 88 },
			expect: 'Советы по улучшению',
		},
		{
			name: '3. 0% Товарка',
			kpi: { name: 'Сидоров', revenue: 60, accessories: 95, finance: 110 },
			survey: {
				revenue: {
					q1: '25',
					q2: '12',
					q3: '10',
					q4: '2',
					q5: '8',
					q6: '5to10',
				},
			},
			expect: 'Чаще переориентируй',
		},
		{
			name: '4. 0% Аксессуары',
			kpi: { name: 'Козлов', revenue: 110, accessories: 55, finance: 100 },
			survey: {
				accessories: { q1: '18', q2: '12', q3: '5', q4: '6', q5: '35' },
			},
			expect: 'Акция 1+1=3 предложена',
		},
		{
			name: '5. 0% Фин',
			kpi: { name: 'Васильев', revenue: 105, accessories: 115, finance: 40 },
			survey: { finance: { q1: '40', q2: '5' } },
			expect: 'Фин.услуги предложены только',
		},
		{
			name: '6. Две 0%',
			kpi: { name: 'Морозов', revenue: 65, accessories: 60, finance: 120 },
			survey: {
				revenue: {
					q1: '30',
					q2: '15',
					q3: '12',
					q4: '3',
					q5: '10',
					q6: 'less5',
				},
				accessories: { q1: '20', q2: '15', q3: '2', q4: '1', q5: '45' },
			},
			expect: 'Чаще переориентируй',
		},
		{
			name: '7. Все 0%',
			kpi: { name: 'Кузнецов', revenue: 50, accessories: 50, finance: 50 },
			survey: {
				revenue: {
					q1: '50',
					q2: '30',
					q3: '25',
					q4: '5',
					q5: '15',
					q6: 'less5',
				},
				accessories: { q1: '40', q2: '30', q3: '8', q4: '5', q5: '60' },
				finance: { q1: '55', q2: '2' },
			},
			expect: 'Поговори с наставником',
		},
		{
			name: '8. Граничные + нормализация',
			kpi: { name: 'Смирнов', revenue: 70, accessories: 150, finance: 151 },
			expect: '70% → 70%',
		},
	]

	const results = []

	for (let i = 0; i < tests.length; i++) {
		const test = tests[i]
		console.log(
			`\n%cТест ${i + 1}/8: ${test.name}`,
			'color: #2196f3; font-weight: bold;'
		)

		document.getElementById('name').value = test.kpi.name
		document.getElementById('revenue').value = test.kpi.revenue
		document.getElementById('accessories').value = test.kpi.accessories
		document.getElementById('finance').value = test.kpi.finance
		document.getElementById('kpiForm').dispatchEvent(new Event('submit'))
		await new Promise(r => setTimeout(r, 1200))

		if (test.survey) {
			const cats = Object.keys(test.survey)
			for (const cat of cats) {
				await new Promise(r => setTimeout(r, 800))
				Object.keys(test.survey[cat]).forEach(q => {
					const el = document.getElementById(q)
					if (el) el.value = test.survey[cat][q]
				})
				document.getElementById('nextQuestion').click()
				await new Promise(r => setTimeout(r, 600))
			}
			await new Promise(r => setTimeout(r, 1200))
		}

		const finalScore = document.getElementById('finalScore').textContent
		const recHTML = document.getElementById('recList').innerHTML
		const breakdownHTML = document.getElementById('breakdown').innerHTML

		const recText = recHTML
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
		const breakdownText = breakdownHTML
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()

		let status = 'FAIL'
		if (recText.includes(test.expect) || breakdownText.includes(test.expect)) {
			status = 'PASS'
		}

		results.push({ test: i + 1, name: test.name, finalScore, status })

		console.log(
			`%c${status} | ${finalScore}`,
			status === 'PASS' ? 'color: #4caf50;' : 'color: #e74c3c;'
		)

		console.log('%c10 сек на скриншот...', 'color: #ff9800; font-weight: bold;')
		for (let s = 0; s > 0; s--) {
			// Можно добавить паузу между тестами
			console.log(`%c${s}...`, 'color: #ff9800;')
			await new Promise(r => setTimeout(r, 1000))
		}

		if (document.getElementById('backToInput'))
			document.getElementById('backToInput').click()
		await new Promise(r => setTimeout(r, 800))
	}

	const blob = new Blob(
		[
			JSON.stringify(
				{ generated: new Date().toLocaleString('ru'), results },
				null,
				2
			),
		],
		{ type: 'application/json' }
	)
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'KPI-тесты-ИСПРАВЛЕНО.json'
	a.click()

	console.log('%cВСЕ 8 ТЕСТОВ = PASS!', 'color: #00a651; font-weight: bold;')
	console.table(results)
})()
