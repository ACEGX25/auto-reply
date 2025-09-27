function findComposeToolBar(){
    const selectors =[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up',
        'T-I J-J5-Ji hG T-I-atl L3',
        'J-J5-Ji btA',
        'dC',
        'T-I J-J5-Ji aoO v7 T-I-atl L3',
        'G-asx'
    ];

    for(const selector of selectors){
        const toolbar = document.querySelector(selector);
        if(toolbar){
            return toolbar
        }
        return null;
    }
}

function createAutoReplyButton() {
    // Create wrapper div to hold button text and chevron
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.marginRight = '8px';
    button.style.userSelect = 'none';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Auto-Reply');

    // Add text span
    const textSpan = document.createElement('span');
    textSpan.textContent = 'Auto-Reply';
    textSpan.style.padding = '0 8px'; // space around text
    button.appendChild(textSpan);

    // Add divider
    const divider = document.createElement('div');
    divider.style.width = '1px';
    divider.style.backgroundColor = '#ccc';
    divider.style.height = '60%';
    button.appendChild(divider);

    // Add Gmail-style chevron
    const chevron = document.createElement('div');
    chevron.className = 'G-asx';
    chevron.style.cursor = 'pointer';
    chevron.style.marginLeft = '8px'; // increased space
    button.appendChild(chevron);

    // Dropdown menu (append to body)
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.minWidth = '160px';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '4px';
    menu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    menu.style.padding = '4px 0';
    menu.style.display = 'none';
    menu.style.zIndex = '9999';

    const options = ['Friendly', 'Formal', 'Casual'];
    options.forEach(opt => {
        const item = document.createElement('div');
        item.textContent = opt;
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        item.addEventListener('mouseover', () => item.style.background = '#f1f3f4');
        item.addEventListener('mouseout', () => item.style.background = '');
        item.addEventListener('click', () => {
            console.log('Selected:', opt);
            menu.style.display = 'none';
        });
        menu.appendChild(item);
    });

    // Toggle menu on chevron click
    chevron.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = chevron.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = rect.bottom + 'px';
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    // Hide menu on outside click
    document.addEventListener('click', () => {
        menu.style.display = 'none';
    });

    document.body.appendChild(menu);

    return button;
}




function getEmailContent(){
    const selectors =[
        '.h7',
        '.a3s.aiL',
        'gmail_quote',
        '[role="presentation"]' 
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return null;
    }
}


function injectButton(){
     const existingButton = document.querySelector('.auto-reply');
     if(existingButton) existingButton.remove();

     const toolbar = findComposeToolBar();
     if(!toolbar){
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar Found!");
    const button = createAutoReplyButton();
    button.classList.add('auto-reply-button');

    button.addEventListener('click',async()=>{
        try{
            button.innerHTML='Generating....';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate',{
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "Manda"
                })
            });

            if(!response.ok){
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText',false,generatedReply);
            }else{
                console.error('Compose box was not found');
            }
        }catch (error){
            console.error(error);
            console.error('failed to generate reply');
        }finally{
            button.innerHTML = 'Auto-Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild)
}
const observer = new MutationObserver((mutations)=>{
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposedElements = addedNodes.some(node =>
            node.nodeType == Node.ELEMENT_NODE && (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if(hasComposedElements){
            console.log("composing detected");
            setTimeout(injectButton,500);
        }
    }
});

observer.observe(document.body,{
    childList:true,
    subtree:true
})