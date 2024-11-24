import { toSimplified, toTraditional } from 'chinese-simple2traditional'

import { setupEnhance } from 'chinese-simple2traditional/enhance'
import './styles.css'

setupEnhance() // 注入短语库

const toggle = document.querySelector('#toggle') as HTMLButtonElement
const enhance = document.querySelector('#enhance') as HTMLInputElement
const input = document.querySelector('#input') as HTMLTextAreaElement
const output = document.querySelector('#output') as HTMLParagraphElement
const meta = document.querySelector('#meta') as HTMLParagraphElement
const langs = document.querySelector('.langs') as HTMLDivElement

let type: 's2t' | 't2s' = 's2t'
let isEnhance = false

toggle.addEventListener('click', () => {
  type = type === 's2t' ? 't2s' : 's2t'
  langs.classList.toggle('reverse')
  convert()
})

enhance.addEventListener('change', () => {
  isEnhance = enhance.checked
  convert()
})

input.addEventListener('input', () => {
  convert()
}, { passive: true })

function convert() {
  const text = input.value
  const begin = performance.now()
  const result = type === 's2t' ? toTraditional(text, isEnhance) : toSimplified(text, isEnhance)
  const time = performance.now() - begin

  output.innerHTML = result.replace(/\n$/, '<br><br>').replace(/\n/g, '<br>')

  input.style.setProperty('height', `${output.offsetHeight}px`)

  meta.textContent = `共 ${text.replace(/\n/g, '').length} 字，耗时 ${time.toFixed(4)}ms`
}

input.focus()
