package com.bhirithi.companion.data
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
interface BhirithiRepository {
    val selectedSection: Flow<String>
    suspend fun selectSection(section: String)
}
class InMemoryBhirithiRepository : BhirithiRepository {
    private val section = MutableStateFlow("Panda")
    override val selectedSection: Flow<String> = section.asStateFlow()
    override suspend fun selectSection(section: String) { this.section.value = section }
}
