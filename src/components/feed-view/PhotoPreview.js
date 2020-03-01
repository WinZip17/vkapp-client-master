import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
// import HeaderButton from "@vkontakte/vkui/dist/components/HeaderButton/HeaderButton";
import {IOS, platform} from "@vkontakte/vkui";
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";

const osName = platform();

const PhotoPreview = ({ id, photo, setPanelFeed}) => {

	return <Panel id={id}>
			<PanelHeader
		left={<PanelHeaderButton  onClick={() => {setPanelFeed('/feed')}}>
			{osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
		</PanelHeaderButton >}
	> </PanelHeader>
		<img src={photo} alt={'img'} className='photo-preview' />
	</Panel>
};



export default PhotoPreview;
