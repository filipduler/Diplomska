const StyleService = 
{
    colorPalette: {
        c1: '#C2DED1',
        c2: '#ECE5C7',
        c3: '#CDC2AE',
        c4: '#354259',
    },
    getColorFromStatus: (statusId) => {
        let color;
        switch(statusId) {
            case 2: color = '#7cfc00'; break;
            case 3: 
            case 4: color = '#dc143c'; break;
            default: color = '#ffff00'; break;
        }
        return color;
    }
};

export default StyleService; 