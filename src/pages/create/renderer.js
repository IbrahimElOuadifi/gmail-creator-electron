const { ipcRenderer } = require('electron')

const formSelector = document.querySelector('form')

const use_api_check = document.getElementById('use-api-check')
const country_input = document.getElementById('country-input')
const operator_input = document.getElementById('operator-input')
const product_input = document.getElementById('product-input')
const sim_provider_input = document.getElementById('sim-provider-input')
const ath_api_key_input = document.getElementById('ath-api-key')

const select_browser = document.getElementById('select-browser')
const select_browser_text = document.getElementById('select-browser-text')

const select_profile_path = document.getElementById('select-profile-path')
const select_profile_path_text = document.getElementById('select-profile-path-text')

const save_data = document.getElementById('save-data')
const save_data_text = document.getElementById('save-data-text')

const select_proxys = document.getElementById('select-proxys')
const proxys_port = document.getElementById('proxys-port')
const proxys_port_seter = document.getElementById('proxys-port-seter')
const proxy_list = document.getElementById('proxy-list')

const option_delay = document.getElementById('option-delay')

const indicator = document.getElementById('indicator')

const start_btn = document.getElementById('start-btn')
const stop_btn = document.getElementById('stop-btn')

const checkAPISim = checked => {
    country_input.disabled = !checked
    operator_input.disabled = !checked
    product_input.disabled = !checked
    sim_provider_input.disabled = !checked
    ath_api_key_input.disabled = !checked
}

const isProxysValid = proxy => {
    return /^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/.test(proxy)
}

const isProxysAndPortValid = proxy => {
    return /^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\:[0-9]{1,5})$/.test(proxy)
}


formSelector.addEventListener('submit', e => {
    e.preventDefault()

    const fields = {
        api_sim: {
            enable: use_api_check.checked,
            country: country_input.value,
            operator: operator_input.value,
            product: product_input.value,
            provider: sim_provider_input.value,
            authorization: ath_api_key_input.value
        },
        browser_path: select_browser_text.value,
        profiles_path: select_profile_path_text.value,
        save_file_path: save_data_text.value,
        option: {
            delay: option_delay.value
        },
        proxys: proxy_list.value.split('\n')
    }

    // if(fields.api_5sim.enable) {
    //     if(!fields.api_5sim.country || !fields.api_5sim.operator || !fields.api_5sim.product || !fields.browser_path || fields.option.delay !== '' || !fields.proxys.length || !fields.save_file_path) return ipcRenderer.send('message-box', { type: 'error', message: 'fields are required' })
    // }
    // else {
    //     if(!fields.browser_path || fields.option.delay !== '' || !fields.proxys.length || !fields.save_file_path) return ipcRenderer.send('message-box', { type: 'error', message: 'fields are required' })
    // }

    if(fields.proxys.some(proxy => isProxysValid(proxy))) return ipcRenderer.send('message-box', { type: 'error', message: 'One or more proxy has no port!' })
    if(fields.proxys.some(proxy => !isProxysAndPortValid(proxy))) return ipcRenderer.send('message-box', { type: 'error', message: 'One or more proxy are not correct!' })
    if(fields.proxys.length === 0) return ipcRenderer.send('message-box', { type: 'error', message: 'User data is empty!' })

    ipcRenderer.send('start-browser-create', fields)
})

stop_btn.addEventListener('click', () => {
    ipcRenderer.send('script-status', 'stop')
})

select_browser.addEventListener('click', () => ipcRenderer.send('select-browser'))
select_profile_path.addEventListener('click', () => ipcRenderer.send('select-profile-path'))
save_data.addEventListener('click', () => ipcRenderer.send('save-data-path'))
select_proxys.addEventListener('click', () => ipcRenderer.send('select-proxy-list'))

proxys_port_seter.addEventListener('click', () => {
    const port = proxys_port.value
    const list = proxy_list.value.split('\n').filter(item => isProxysAndPortValid(item) || isProxysValid(item))
    proxy_list.value = list.map(item => isProxysValid(item) ? `${item}:${port}` : item).join('\n')
})

ipcRenderer.on('select-browser-result', (_, data) => {
    select_browser_text.value = data
})

ipcRenderer.on('select-profile-path-result', (_, data) => {
    select_profile_path_text.value = data
})

ipcRenderer.on('save-data-path-result', (_, data) => {
    save_data_text.value = data
})

ipcRenderer.on('select-proxy-list-result', (_, data) => {
    proxy_list.value = data
})

ipcRenderer.on('indicator-result', (_, { value, from, proxy }) => {
    indicator.value = `${value} from ${from} --${proxy}`
    if(value <= from) {
        start_btn.classList.add('d-none')
        stop_btn.classList.remove('d-none')
    } else {
        stop_btn.classList.add('d-none')
        start_btn.classList.remove('d-none')
    }

    if(isProxysAndPortValid(proxy)) proxy_list.value = proxy_list.value.split('\n').filter(p => p !== proxy).join('\n')
})

ipcRenderer.on('indicator-end', () => {
    indicator.value = ``
    stop_btn.classList.add('d-none')
    start_btn.classList.remove('d-none')

})

use_api_check.addEventListener('change', e => checkAPISim(e.target.checked))

checkAPISim(use_api_check.checked)
// ath_api_key_input.value = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Nzc2MTQ1MjYsImlhdCI6MTY0NjA3ODUyNiwicmF5IjoiYTY5MjdjMjY1YmY3MjE2NmNlNjI5NmMxMDJhYTk5M2UiLCJzdWIiOjk1Nzg2N30.JzNg9T_c9ptHR4RVKd1fJx525FzK3Z35dIYGNzamlVfEjCFdmcwUbpUL-rz6cUsxYGRllXVyH56gVv_OQYORNAfchKi3EZ9thdZtbqcvTjXdBHHGhRlzDZPd-T1-IELi5xXXv3Ga_jOAYh-QWkhfiuPsYGnnuJHLrDogFCpIKp7vfeM3DM13rpxOvZS5TXTtIyWvEy7mTjWlBTnXTbvKphJ0ltOwFjxdDCQMU1R9WfJDinSdm0Zpagr_dPy6dzVmmATHpgLoYHADLpOvEejyy_7aG6y-r6YvjDuLq3NsflNR9yWfR0uHeaJxgomBAJvlNIEAoemKbT8bOhZyUuZaOA'