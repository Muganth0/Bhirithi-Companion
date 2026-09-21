package com.bhirithi.companion.ui
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bhirithi.companion.data.BhirithiRepository
import com.bhirithi.companion.data.InMemoryBhirithiRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
class BhirithiViewModel(private val repository: BhirithiRepository = InMemoryBhirithiRepository()) : ViewModel() {
    val selectedSection: StateFlow<String> = repository.selectedSection.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "Panda")
    fun selectSection(section: String) { viewModelScope.launch { repository.selectSection(section) } }
}
