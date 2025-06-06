"use client"

import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import React from "react";

interface SearchInputProps {
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
}

export default function SearchInput( {searchValue, setSearchValue}: SearchInputProps) {
  return (
    <div className={'w-full sm:w-1/2 relative'}>
      <Search className={'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10'}/>

      <Input
        value={searchValue}
        placeholder={'Suche nach Programmen...'}
        type={'search'}
        className={'w-full'}
        onChange={(e) => {
          setSearchValue(e.target.value)
        }}
      />
    </div>
  )
}