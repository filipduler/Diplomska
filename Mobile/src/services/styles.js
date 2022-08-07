import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    circle: {
        width: 16,
        height: 16,
        borderRadius: 16 / 2,
        borderWidth: 0.8
    },
})

const StyleService = 
{
    getColorFromStatus: (statusId) => {
        let color;
        switch(statusId) {
            case 2: color = '#7cfc00'; break;
            case 3: 
            case 4: color = '#dc143c'; break;
            default: color = '#ffff00'; break;
        }
        return color;
    },
    get style() {
        return styles;
    } 
};

export default StyleService; 