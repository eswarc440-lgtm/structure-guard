# GIS Page Filter Tests

## Test Scenarios

### 1. Type Filter Tests

#### Test 1.1: All Types Default
- **Precondition**: Page loads with assets from API
- **Expected**: "All Types" dropdown shows "All Types" as selected
- **Expected**: All asset types are listed in the dropdown
- **Expected**: No filtering is applied, all assets display

#### Test 1.2: Filter by Type
- **Precondition**: Page loads and assets are available
- **Action**: Select "Bridge" from type dropdown
- **Expected**: Only assets with type="Bridge" display on map
- **Expected**: Asset count updates to show only bridges
- **Expected**: Selected asset panel reflects a bridge if selected

#### Test 1.3: Type Filter with Other Filters
- **Precondition**: Type filter is set to "Bridge"
- **Action**: Select "Nandyal" from district dropdown
- **Expected**: Only bridges in Nandyal district display
- **Expected**: Combined filtering works correctly

### 2. District Filter Tests

#### Test 2.1: All Districts Default
- **Precondition**: Page loads with assets from API
- **Expected**: "All Districts" dropdown shows "All Districts" as selected
- **Expected**: All unique districts are listed alphabetically
- **Expected**: No filtering is applied

#### Test 2.2: Filter by District
- **Precondition**: Page loads and assets are available
- **Action**: Select "Nandyal" from district dropdown
- **Expected**: Only assets in Nandyal district display on map
- **Expected**: Asset count updates
- **Expected**: Selected asset panel shows Nandyal location

#### Test 2.3: District Filter with Search
- **Precondition**: District filter is set to "Nandyal"
- **Action**: Type "causeway" in search bar
- **Expected**: Only assets in Nandyal that contain "causeway" display
- **Expected**: Combined filtering works

### 3. Search Filter Tests

#### Test 3.1: Search with Type Filter
- **Precondition**: Type filter is set to "Road"
- **Action**: Type "highway" in search
- **Expected**: Only roads containing "highway" display
- **Expected**: Multiple filters combine correctly

#### Test 3.2: Search with All Filters
- **Precondition**: Type="Bridge", District="Nandyal"
- **Action**: Type "arch" in search
- **Expected**: Only bridges in Nandyal with "arch" in name display

### 4. Clear Filters Button Tests

#### Test 4.1: Clear All Filters
- **Precondition**: Filters set: Type="Bridge", District="Nandyal", Search="causeway"
- **Action**: Click "Clear Filters" button
- **Expected**: Type resets to "All Types"
- **Expected**: District resets to "All Districts"
- **Expected**: Search input clears
- **Expected**: All assets display on map

#### Test 4.2: Clear Filters from Various States
- **Precondition**: Only search filter active
- **Action**: Click "Clear Filters"
- **Expected**: Search clears, all assets display

### 5. Unique Value Extraction Tests

#### Test 5.1: Types Are Sorted
- **Expected**: Types in dropdown appear in alphabetical order
- **Expected**: No duplicate types appear

#### Test 5.2: Districts Are Sorted
- **Expected**: Districts in dropdown appear in alphabetical order
- **Expected**: No duplicate districts appear
- **Expected**: Empty/null districts are excluded

#### Test 5.3: Unique Values Update
- **Precondition**: Page loads with initial assets
- **Expected**: Types and districts match unique values from loaded assets

### 6. Asset Count Display

#### Test 6.1: Count Reflects Filters
- **Precondition**: Page loads with 50 assets total
- **Action**: Select "Bridge" type
- **Expected**: Count shows only bridge count (e.g., "15 assets shown")
- **Expected**: Count updates correctly

#### Test 6.2: Count with Multiple Filters
- **Action**: Select Type="Bridge", District="Nandyal"
- **Expected**: Count shows only bridges in Nandyal
- **Expected**: Example: "5 assets shown"

### 7. UI/UX Tests

#### Test 7.1: Dropdown Layout
- **Expected**: Two dropdowns visible above search bar on desktop
- **Expected**: Layout is responsive (grid cols change for mobile)
- **Expected**: Clear Filters button positioned on same row

#### Test 7.2: Dropdown Styling
- **Expected**: Dropdowns match Radix UI Select component styling
- **Expected**: Selected values display correctly in trigger
- **Expected**: Dropdown content scrolls if many options

#### Test 7.3: Clear Button Icon
- **Expected**: X icon displays before "Clear Filters" text
- **Expected**: Icon is visible and properly sized

### 8. Integration Tests

#### Test 8.1: Map Layers + Type Filter
- **Precondition**: Map Layers checkboxes and Type dropdown both active
- **Action**: Uncheck "Bridge" in Map Layers
- **Expected**: Bridges don't display regardless of Type filter
- **Expected**: Layer checkboxes take precedence (AND logic)

#### Test 8.2: Selected Asset Persists
- **Action**: Select asset → change type filter
- **Expected**: Selected asset updates if it matches new filters
- **Expected**: Asset details panel updates accordingly

#### Test 8.3: Search and Layer Filters
- **Action**: Uncheck some layer types and search
- **Expected**: Search respects layer visibility settings
- **Expected**: Both filters apply (AND logic)

## Manual Verification Steps

1. **Load the GIS page** - Assets load from API
2. **Check dropdowns** - Verify types and districts are present and sorted
3. **Test each filter independently** - Verify each works alone
4. **Test filter combinations** - Verify combined filters work
5. **Check asset count** - Verify count matches filtered results
6. **Test Clear Filters** - Verify all filters reset
7. **Check responsive design** - Test on mobile/tablet/desktop

## Expected Behavior Summary

- Type and District dropdowns extract unique values from loaded assets
- Both dropdowns default to "All Types" and "All Districts"
- Filtering is additive (AND logic): all enabled filters must match
- Clear Filters button resets Type, District, and Search to defaults
- Asset count in legend updates to show filtered count
- Layout is responsive with proper grid layout adjustments
- Select component from Radix UI is used consistently
- No changes to Map, Legend, Asset Details, or Map Layers sections
