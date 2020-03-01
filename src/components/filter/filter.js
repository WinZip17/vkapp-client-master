import React from 'react';
import {
    getModalSuggestions,
    appModalOpen
} from '../../API/vk-api'
import CustomSelect from "../custom-select/custom-select";
import API from '../../API/API'
import './filter.css'
import {
    Button
} from '@vkontakte/vkui'

export default class Filter extends React.Component {
    setActiveModal(activeModal) {
        console.log('this.props', this.props)
        activeModal = activeModal || null;
        let modalHistory = this.props.modalHistory ? [...this.props.modalHistory] : [];

        if (activeModal === null) {
            modalHistory = [];
        } else if (modalHistory.includes(activeModal)) {
            modalHistory = modalHistory.splice(0, modalHistory.indexOf(activeModal) + 1);
        } else {
            modalHistory.push(activeModal);
        }

        this.props.updateModal(activeModal, modalHistory);
    };
    render() {
      const filter = this.props.type === 'city' ? (
      <>
        <div className="row filter__row-price">
            <div className="col">
      <span>Город: {this.props.currentCity}</span>
            </div>
        </div>

        <div className="row filter__row-inputs_city"  >
            <div className="col-12 center" >
                <Button level="secondary" onClick={() => this.setActiveModal('filters')} size="xl" className="big-button">Выбрать город</Button>
                {/* <button onClick={() => this.setActiveModal('filters')} className="filter-button">Выбрать город</button> */}
            </div>
        </div>
        </> 
        ) : (
        <>
        <div className='row filter__row-price'>
        <div className='col'>
          <span>Цена:</span>
        </div>
      </div>

      <div className='row filter__row-inputs'>
        <div className='col-6'>
          <input onChange={this.props.setPriceFrom} defaultValue={this.props.priceFrom} type='number' placeholder='От' className='price-input' pattern='\d*' />
        </div>
        <div className='col-6'>
          <input onChange={this.props.setPriceTo} defaultValue={this.props.priceTo} type='number' placeholder='До' className='price-input' pattern='\d*' />
        </div>
      </div>
      </>
      )

        return (
            <div className="container filter" >
                <div className="container">
                    <div className="row filter__row-header">
                        <div className="col">
                            <span>Фильтр</span>
                        </div>
                    </div>
                  {filter}
  



                    {

                        this.props.bigFilter &&
                        <div>
                            <div className="row filter__row-sort">
                                <div className="col-6">
                                    <span>Радиус:</span>
                                </div>
                                <div className="col-6">
                                    <span>Сортировать по:</span>
                                </div>
                            </div>

                            <div className="row filter__row-select">
                                <div className="col-6">
                                    <CustomSelect
                                        select={this.props.searchFilterRadius}
                                        callbackUpdateSelect={this.props.setSearchFilterRadius}
                                        disabled={this.props.disabled}
                                        setCoordinates={this.props.setCoordinates}
                                    />
                                </div>
                                <div className="col-6">
                                    <CustomSelect
                                        select={this.props.disabled ? this.props.searchFilterSortType2 : this.props.searchFilterSortType}
                                        callbackUpdateSelect={this.props.disabled ? this.props.setSearchFilterSortType2 : this.props.setSearchFilterSortType}
                                    />
                                </div>
                            </div>
                        </div>

                    }

                </div>
            </div>

        );
    }
}
