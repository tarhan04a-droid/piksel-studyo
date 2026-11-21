import {t} from './i18n';
import SlidingChoice from './SlidingChoice';
export default function MaskViewSwitch({mask,onChange}:{mask:boolean;onChange:(mask:boolean)=>void}){
 return <SlidingChoice right={mask} onChange={onChange} leftLabel={t('Renkli vurgu')} rightLabel={t('İkili maske')}/>;
}
