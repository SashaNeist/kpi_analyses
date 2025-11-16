// === Глобальные переменные ===
let currentData = {}
let zeroCategories = []
let currentQuestionIndex = 0
let surveyResponses = {}
let hasZeroCategories = false

// === Роутинг ===
function showPage(pageId) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
	document.getElementById(pageId).classList.add('active')
}

// === Нормализация ===
function normalize(value) {
	if (value < 70) return 0 // ← < 70 → 0
	if (value > 150) return 150
	return value
}

// === KPI Форма ===
document.getElementById('kpiForm').addEventListener('submit', function (e) {
	e.preventDefault()

	const name = document.getElementById('name').value
	const revenue = parseFloat(document.getElementById('revenue').value)
	const accessories = parseFloat(document.getElementById('accessories').value)
	const finance = parseFloat(document.getElementById('finance').value)

	const normRevenue = normalize(revenue)
	const normAccessories = normalize(accessories)
	const normFinance = normalize(finance)

	const finalEfficiency =
		normRevenue * 0.4 + normAccessories * 0.3 + normFinance * 0.3

	currentData = {
		name,
		revenue,
		accessories,
		finance,
		normRevenue,
		normAccessories,
		normFinance,
		finalEfficiency,
	}
	zeroCategories = []
	if (normRevenue === 0) zeroCategories.push('revenue')
	if (normAccessories === 0) zeroCategories.push('accessories')
	if (normFinance === 0) zeroCategories.push('finance')

	hasZeroCategories = zeroCategories.length > 0

	if (!hasZeroCategories) {
		renderResultPage()
		showPage('resultPage')
	} else {
		startQuestions()
	}
})

// === Рендер результата ===
function renderResultPage() {
	const data = currentData
	const final = data.finalEfficiency

	document.getElementById('resultName').textContent = data.name
	document.getElementById('finalScore').textContent = final.toFixed(1) + '%'

	document.getElementById('breakdown').innerHTML = `
        <strong>Расчёт по категориям:</strong><br>
        • Товарная выручка: ${data.revenue}% → ${
		data.normRevenue
	}% (×40%) → вклад: ${(data.normRevenue * 0.4).toFixed(1)}%<br>
        • Аксессуары: ${data.accessories}% → ${
		data.normAccessories
	}% (×30%) → вклад: ${(data.normAccessories * 0.3).toFixed(1)}%<br>
        • Фин. услуги: ${data.finance}% → ${
		data.normFinance
	}% (×30%) → вклад: ${(data.normFinance * 0.3).toFixed(1)}%
    `

	const recList = document.getElementById('recList')
	recList.innerHTML = ''

	// === 1. ≥100% → Похвала ===
	if (final >= 100) {
		const praise = document.createElement('div')
		praise.className = 'rec-item'
		praise.innerHTML = `
            <strong>Поздравляем, ${data.name}!</strong><br>
            Вы достигли <strong>${final.toFixed(
							1
						)}%</strong> эффективности — это отличный результат!<br>
            Продолжайте в том же духе и не забывайте предлагать акции: <em>1+1=3</em>, <em>альтернативные модели</em>, <em>антивирус</em>!
        `
		recList.appendChild(praise)
	}
	// === 2. <100%, но все >70% → советы ===
	else {
		const advice = []
		if (data.revenue < 100)
			advice.push(
				'Переориентируй клиента на <strong>альтернативные акционные модели</strong>!'
			)
		if (data.accessories < 100)
			advice.push(
				'Акция <strong>1 + 1 = 3</strong> должна проговариваться <strong>каждому клиенту</strong>!'
			)
		if (data.finance < 100)
			advice.push(
				'Если забываешь предлагать разные финансовые услуги — возьми за правило <strong>каждому клиенту предложить наш антивирус</strong>!'
			)

		if (advice.length > 0) {
			const block = document.createElement('div')
			block.className = 'rec-item'
			block.innerHTML = `<strong>Советы по улучшению:</strong><br>${advice
				.map(a => `• ${a}`)
				.join('<br>')}`
			recList.appendChild(block)
		}
	}

	// === 3. Советы по опросникам ===
	const surveyAdvice = []

	// ——— ТОВАРНАЯ ВЫРУЧКА ———
	if (surveyResponses.revenue) {
		const r = surveyResponses.revenue
		const totalClients = parseInt(r.q1) || 0
		const refusedPrice = parseInt(r.q3) || 0
		const offeredAlt = parseInt(r.q4) || 0
		const notInterestedOffered = parseInt(r.q5) || 0
		const avgTime = r.q6

		if (refusedPrice > offeredAlt) {
			surveyAdvice.push(
				'Чаще переориентируй на <strong>акционные модели</strong> — каждый отказ из-за цены — упущенная продажа!'
			)
		}
		if (avgTime === 'less5' || avgTime === '5to10') {
			surveyAdvice.push(
				'Рассказывай <strong>подробнее</strong>: фишки, сравнения, альтернативы. <strong>10+ минут</strong> = выше конверсия!'
			)
		}
		const percentToNotInterested =
			totalClients > 0 ? (notInterestedOffered / totalClients) * 100 : 0
		if (percentToNotInterested < 50) {
			surveyAdvice.push(
				'Цель: предлагать акционные модели <strong>хотя бы 50% не заинтересованных</strong>!'
			)
		}
	}

	// ——— АКСЕССУАРЫ ———
	if (surveyResponses.accessories) {
		const a = surveyResponses.accessories
		const totalClients = parseInt(a.q5) || 0
		const offeredAction = (parseInt(a.q3) || 0) + (parseInt(a.q4) || 0)
		const percentOffered =
			totalClients > 0 ? (offeredAction / totalClients) * 100 : 0

		if (percentOffered < 70) {
			surveyAdvice.push(
				`Акция <strong>1+1=3</strong> предложена только ${percentOffered.toFixed(
					0
				)}% клиентов. <strong>Цель: ≥70%</strong>!`
			)
		} else {
			surveyAdvice.push(
				`Отлично! Акция 1+1=3 предложена ${percentOffered.toFixed(
					0
				)}% клиентов — выше цели!`
			)
		}
	}

	// ——— ФИН.УСЛУГИ ———
	if (surveyResponses.finance) {
		const f = surveyResponses.finance
		const totalClients = parseInt(f.q1) || 0
		const offeredServices = parseInt(f.q2) || 0
		const percentOffered =
			totalClients > 0 ? (offeredServices / totalClients) * 100 : 0
		const planNotMet = data.finance < 100

		if (percentOffered < 20) {
			surveyAdvice.push(
				`Фин.услуги предложены только ${percentOffered.toFixed(
					0
				)}% клиентов. <strong>Поговори с наставником</strong> — как предлагать чаще!`
			)
		} else if (percentOffered >= 80 && planNotMet) {
			surveyAdvice.push(
				`Предложено ${percentOffered.toFixed(
					0
				)}% — отлично! Но план не выполнен. <strong>Поговори с наставником</strong> по качеству предложения.`
			)
		} else if (percentOffered >= 80) {
			surveyAdvice.push(
				`Предложено ${percentOffered.toFixed(0)}% — супер! План выполнен!`
			)
		}
	}

	if (surveyAdvice.length > 0) {
		const block = document.createElement('div')
		block.className = 'rec-item'
		block.style.background = '#e8f5e8'
		block.style.borderLeft = '4px solid #4caf50'
		block.innerHTML = `
            <strong>По результатам опроса:</strong><br>
            ${surveyAdvice.map(a => `• ${a}`).join('<br>')}
        `
		recList.appendChild(block)
	}

	if (hasZeroCategories && Object.keys(surveyResponses).length > 0) {
		const thanks = document.createElement('div')
		thanks.className = 'rec-item'
		thanks.style.background = '#e3f2fd'
		thanks.style.borderLeft = '4px solid #2196f3'
		thanks.innerHTML = `<em>Спасибо за ответы! Данные помогут улучшить работу.</em>`
		recList.appendChild(thanks)
	}
}

// === Опрос ===
function startQuestions() {
	currentQuestionIndex = 0
	surveyResponses = {}
	showNextQuestion()
}

function showNextQuestion() {
	if (currentQuestionIndex >= zeroCategories.length) {
		renderResultPage()
		showPage('resultPage')
		return
	}

	const category = zeroCategories[currentQuestionIndex]
	const title = {
		revenue: 'Товарная выручка',
		accessories: 'Аксессуары',
		finance: 'Финансовые услуги',
	}[category]

	document.getElementById('questionContent').innerHTML = `
        <div class="question">
            <h3>Вопросы по категории: <strong>${title}</strong></h3>
            <p><em>Ответьте честно — это поможет улучшить результат.</em></p>
            <form id="surveyForm"></form>
        </div>
    `

	const form = document.getElementById('surveyForm')
	form.innerHTML = ''

	if (category === 'revenue') {
		form.innerHTML = `
            <div class="form-group">
                <label>1. Сколько клиентов было за день?</label>
                <input type="number" id="q1" min="0" required>
            </div>
            <div class="form-group">
                <label>2. Сколько клиентов интересовались смартфонами/роутерами?</label>
                <input type="number" id="q2" min="0" required>
             </div>
            <div class="form-group">
                <label>3. Сколько из них отказались от покупки из-за стоимости?</label>
                <input type="number" id="q3" min="0" required>
            </div>
            <div class="form-group">
                <label>4. Скольким из отказавшихся были предложены альтернативные акционные модели?</label>
                <input type="number" id="q4" min="0" required>
            </div>
            <div class="form-group">
                <label>5. Скольким клиентам, не интересовавшимся товаркой, были предложены акционные модели?</label>
                <input type="number" id="q5" min="0" required>
            </div>
            <div class="form-group">
                <label>6. Как долго в среднем длился контакт с клиентом?</label>
                <select id="q6" required>
                    <option value="">— Выберите —</option>
                    <option value="less5">Менее 5 минут</option>
                    <option value="5to10">5–10 минут</option>
                    <option value="10to15">10–15 минут</option>
                    <option value="more15">Более 15 минут</option>
                </select>
            </div>
        `
	} else if (category === 'accessories') {
		form.innerHTML = `
            <div class="form-group">
                <label>1. Сколько клиентов интересовались аксессуарами?</label>
                <input type="number" id="q1" min="0" required>
            </div>
            <div class="form-group">
                <label>2. Сколько из них отказались из-за стоимости?</label>
                <input type="number" id="q2" min="0" required>
            </div>
            <div class="form-group">
                <label>3. Скольким из отказавшихся была предложена акция 1 + 1 = 3?</label>
                <input type="number" id="q3" min="0" required>
            </div>
            <div class="form-group">
                <label>4. Скольким клиентам, не интересовавшимся, была предложена акция 1 + 1 = 3?</label>
                <input type="number" id="q4" min="0" required>
            </div>
            <div class="form-group">
                <label>5. Сколько клиентов было за день?</label>
                <input type="number" id="q5" min="0" required>
            </div>
        `
	} else if (category === 'finance') {
		form.innerHTML = `
            <div class="form-group">
                <label>1. Сколько клиентов было за день?</label>
                <input type="number" id="q1" min="0" required>
            </div>
            <div class="form-group">
                <label>2. Скольким из них были предложены финансовые услуги (чистка, оптимизация, антивирус)?</label>
                <input type="number" id="q2" min="0" required>
            </div>
        `
	}

	showPage('questionsPage')
	document.getElementById('nextQuestion').style.display = 'block'
	document.getElementById('finishQuestions').style.display = 'none'
	document.getElementById('errorMsg').textContent = ''
}

// === Сохранение ответов ===
document.getElementById('nextQuestion').addEventListener('click', () => {
	const form = document.getElementById('surveyForm')
	if (!form.checkValidity()) {
		document.getElementById('errorMsg').textContent =
			'Пожалуйста, заполните все поля.'
		return
	}

	const category = zeroCategories[currentQuestionIndex]
	const responses = {}

	for (let i = 1; i <= 6; i++) {
		const el = document.getElementById(`q${i}`)
		if (el) responses[`q${i}`] = el.value
	}

	surveyResponses[category] = responses

	localStorage.setItem(
		'survey_' + currentData.name + '_' + Date.now(),
		JSON.stringify({
			kpi: currentData,
			responses: surveyResponses,
		})
	)

	currentQuestionIndex++
	showNextQuestion()
})

// === Кнопки ===
document.getElementById('backToInput').addEventListener('click', () => {
	document.getElementById('kpiForm').reset()
	showPage('inputPage')
})

document.getElementById('finishQuestions').addEventListener('click', () => {
	showPage('inputPage')
	document.getElementById('kpiForm').reset()
})
