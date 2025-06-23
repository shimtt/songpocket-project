import React from 'react';
import CategoryCard from '../category_card/CategoryCard';
import AiRecommendation from '../ai_recommendation/AiRecommendation';
import AiPopular from '../ai_popular/AiPopular';
import './CategoryList.css'

const CategoryList = ({ aiRefreshTrigger }) => {
  return (
    <div className="category-wrapper">
      <div className="category-header">카테고리</div>
      <div className="category-container">
        <CategoryCard color="#f1c40f" to="/realtime">
          실시간 랭킹<br />
          지금 가장 인기 많은 곡
        </CategoryCard>

        <CategoryCard color="#e74c3c" to="/latte">
          라떼랭킹<br />
          2000~2005년 명곡 모음 (멜론차트 기준)
        </CategoryCard>

        <CategoryCard color="#5098d1" to="/playlist">
          플레이리스트<br />
          담은 곡 모아보기
        </CategoryCard>
      </div>
      
      {/* Ai 추천 + 많이 담긴 곡 */}
      <div className="ai-row-wrapper">
        <div className="ai-card-left">
          <AiRecommendation refreshTrigger={aiRefreshTrigger} />
        </div>

        <div className="ai-card-right">
          <AiPopular/>
        </div>
      </div>

  </div>
  )
}

export default CategoryList;