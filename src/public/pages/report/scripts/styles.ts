function addEffect(triggerClassName: string, targetClassName: string, classListToBeAdded: string) {
    const triggerElements = document.querySelectorAll(triggerClassName) as NodeListOf<HTMLElement>;

    triggerElements.forEach((triggerElement: HTMLElement) => {
        triggerElement.addEventListener('mouseover', () => {
            const targetElements = document.querySelectorAll(targetClassName) as NodeListOf<HTMLElement>;
            targetElements.forEach((targetElement: HTMLElement) => {
                targetElement.classList.add(classListToBeAdded);
            });
        });

        triggerElement.addEventListener('mouseout', () => {
            const targetElements = document.querySelectorAll(targetClassName) as NodeListOf<HTMLElement>;
            targetElements.forEach((targetElement: HTMLElement) => {
                targetElement.classList.remove(classListToBeAdded);
            });
        });
    });
}

const depthSlider = document.getElementById('depth-slider') as HTMLInputElement;

depthSlider.addEventListener('input', () => {
    const minValue = parseFloat(depthSlider.min);
    const maxValue = parseFloat(depthSlider.max);
    const sliderValue = parseFloat(depthSlider.value);

    const percentage = ((sliderValue - minValue) / (maxValue - minValue)) * 100;

    const gradientValue = `linear-gradient(to right, #4caf50 0%, #4caf50 ${percentage}%, var(--secondary-color) ${percentage}%, var(--secondary-color) 100%)`;

    depthSlider.style.background = gradientValue;
});




addEffect('.logo', '.knight', "fa-bounce");

addEffect(".analyse", ".mag", "fa-shake");
